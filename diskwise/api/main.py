"""
FastAPI backend for DiskWise web interface.

Provides REST API endpoints for disk scanning and file analysis.
Delegates logic to infra (I/O) and core (rules) layers.
"""

import os
import shutil
import platform
import subprocess
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, Field

# Internal imports from new layers
from core.models import FileMetadata
from core.rules import determine_safety_status
from infra.scanner import (
    scan_path, 
    sanitize_path, 
    calculate_directory_size, 
    get_file_category,
)

app = FastAPI(
    title="DiskWise API",
    description="Disk space analysis and cleanup API",
    version="2.1.0",
)

# Security Headers Middleware
class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self' http://localhost:8000;"
        )
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecureHeadersMiddleware)

# CORS for frontend communication
# Only allow specific origins in production, but keeping it flexible for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# =============================================================================
# Pydantic Models
# =============================================================================

class FileItemResponse(BaseModel):
    """Response model for file/directory items."""
    id: str
    name: str
    path: str
    size: int = Field(..., description="Size in bytes")
    type: str = Field(..., pattern="^(file|directory)$")
    safety_status: str = Field(..., pattern="^(safe|warning|danger|unknown)$")
    category: Optional[str] = None
    children_count: Optional[int] = None


class DiskUsageResponse(BaseModel):
    """Response model for disk usage statistics."""
    total: int = Field(..., description="Total capacity in bytes")
    used: int = Field(..., description="Used space in bytes")
    free: int = Field(..., description="Free space in bytes")
    percent_used: float = Field(..., description="Percentage used")


class CategoryBreakdown(BaseModel):
    """Category breakdown for disk usage."""
    name: str
    size: int
    color: str
    percentage: float


class ScanResultResponse(BaseModel):
    """Response model for scan results."""
    path: str
    files: List[FileItemResponse]
    total_size: int
    safe_to_delete_size: int
    compressible_size: int
    categories: List[CategoryBreakdown]


class SafetyCheckRequest(BaseModel):
    """Request model for safety check."""
    path: str


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "DiskWise API",
        "version": "2.1.0",
        "status": "running"
    }


@app.get("/api/disk-usage")
async def get_disk_usage(
    path: str = Query(default="~", description="Path to check disk usage for")
) -> DiskUsageResponse:
    """Get disk usage statistics for a path."""
    try:
        target_path = sanitize_path(path)
        stat = shutil.disk_usage(target_path)
        return DiskUsageResponse(
            total=stat.total,
            used=stat.used,
            free=stat.free,
            percent_used=round((stat.used / stat.total) * 100, 2)
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get disk usage: {str(e)}")


@app.get("/api/scan")
async def scan_api_path(
    path: str = Query(default="~", description="Path to scan"),
    max_depth: int = Query(default=2, ge=1, le=5, description="Maximum scan depth")
) -> ScanResultResponse:
    """Scan a directory and analyze files."""
    try:
        target_path = sanitize_path(path)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    if not target_path.is_dir():
        raise HTTPException(status_code=400, detail="Path is not a directory")
    
    # Check for Python
    python_installed = shutil.which("python") is not None
    
    # Scan directory
    files = []
    category_sizes: dict = {}
    total_size = 0
    safe_to_delete_size = 0
    compressible_size = 0
    
    # Assign colors to categories
    category_colors = {
        "Python Cache": "#4caf50",
        "Node Modules": "#4caf50",
        "Log Files": "#4caf50",
        "Temp Files": "#4caf50",
        "Cache": "#4caf50",
        "Build Artifacts": "#4caf50",
        "Virtual Environments": "#4caf50",
        "Images": "#ffc107",
        "Videos": "#ffc107",
        "Audio": "#ffc107",
        "Documents": "#2196f3",
        "Archives": "#9c27b0",
        "Directory": "#607d8b",
        "Other": "#9e9e9e",
    }

    for metadata in scan_path(target_path, max_depth):
        is_dir = metadata.path.is_dir()
        
        # Determine if this item should be counted in totals
        # We only count files, OR directories that are at the max_depth (leaves of our scan)
        # This prevents double-counting directores and their children.
        depth = len(metadata.path.relative_to(target_path).parts)
        is_leaf = is_dir and depth == max_depth
        
        if not is_dir or is_leaf:
            total_size += metadata.size
            
            # Category analysis
            category = get_file_category(metadata.path)
            category_sizes[category] = category_sizes.get(category, 0) + metadata.size

        # Safety analysis
        safety_status = determine_safety_status(metadata, python_installed)
        if safety_status == "safe":
            # Only count safe size for leaves/files to avoid double counting
            if not is_dir or is_leaf:
                safe_to_delete_size += metadata.size
        elif safety_status in ["warning", "unknown"] and not is_dir:
            compressible_size += metadata.size
            
        children_count = None
        if is_dir:
            try:
                children_count = sum(1 for _ in os.scandir(metadata.path) if _.is_dir(follow_symlinks=False))
            except (PermissionError, OSError):
                pass

        files.append(FileItemResponse(
            id=str(hash(metadata.path)),
            name=metadata.name,
            path=str(metadata.path),
            size=metadata.size,
            type="directory" if is_dir else "file",
            safety_status=safety_status,
            category=get_file_category(metadata.path),
            children_count=children_count
        ))
    
    # Build category breakdown
    categories = [
        CategoryBreakdown(
            name=name,
            size=size,
            color=category_colors.get(name, "#9e9e9e"),
            percentage=round((size / total_size) * 100, 2) if total_size > 0 else 0
        )
        for name, size in sorted(category_sizes.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return ScanResultResponse(
        path=str(target_path),
        files=files,
        total_size=total_size,
        safe_to_delete_size=safe_to_delete_size,
        compressible_size=compressible_size,
        categories=categories
    )


@app.post("/api/check-safety")
async def check_safety_api(request: SafetyCheckRequest) -> dict:
    """Check the safety status of a specific file or directory."""
    try:
        target_path = sanitize_path(request.path)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    is_dir = target_path.is_dir()
    size = calculate_directory_size(target_path) if is_dir else target_path.stat().st_size
    
    metadata = FileMetadata(path=target_path, name=target_path.name, size=size)
    
    python_installed = shutil.which("python") is not None
    safety_status = determine_safety_status(metadata, python_installed)
    
    return {
        "path": str(target_path),
        "name": target_path.name,
        "size": size,
        "type": "directory" if is_dir else "file",
        "safety_status": safety_status,
        "category": get_file_category(target_path)
    }


@app.get("/api/python-installed")
async def check_python_installed_api() -> dict:
    """Check if Python is installed on the system."""
    python_path = shutil.which("python") or shutil.which("python3")
    return {
        "installed": python_path is not None,
        "path": python_path
    }


class ActionRequest(BaseModel):
    """Request model for destructive actions."""
    path: Optional[str] = None
    paths: Optional[List[str]] = None
    force: bool = False


@app.post("/api/delete")
async def delete_api(request: ActionRequest) -> dict:
    """Delete one or more files or directories."""
    from infra.manager import delete_path
    
    paths_to_process = request.paths if request.paths else ([request.path] if request.path else [])
    if not paths_to_process:
        raise HTTPException(status_code=400, detail="No paths provided")
        
    results = []
    errors = []
    
    for p in paths_to_process:
        try:
            if delete_path(p, force=request.force):
                results.append(p)
        except Exception as e:
            errors.append({"path": p, "error": str(e)})
            
    return {
        "status": "success" if results else "failed",
        "deleted": results,
        "errors": errors
    }


@app.post("/api/compress")
async def compress_api(request: ActionRequest) -> dict:
    """Compress one or more files or directories into ZIP archives."""
    from infra.manager import compress_path
    
    paths_to_process = request.paths if request.paths else ([request.path] if request.path else [])
    if not paths_to_process:
        raise HTTPException(status_code=400, detail="No paths provided")
        
    results = []
    errors = []
    
    for p in paths_to_process:
        try:
            archive_path = compress_path(p)
            results.append({"original": p, "archive": str(archive_path)})
        except Exception as e:
            errors.append({"path": p, "error": str(e)})
            
    return {
        "status": "success" if results else "failed",
        "compressed": results,
        "errors": errors
    }


@app.post("/api/open-path")
async def open_path_api(path: str = Query(..., description="Path to open")) -> dict:
    """Open a file or directory in the system's default file manager."""
    try:
        target_path = sanitize_path(path)
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="Path not found")
        
        system = platform.system()
        if system == "Darwin":  # macOS
            subprocess.run(["open", str(target_path)], check=True)
        elif system == "Windows":
            os.startfile(str(target_path))
        else:  # Linux and others
            subprocess.run(["xdg-open", str(target_path)], check=True)
            
        return {"status": "success", "message": f"Opened {path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to open path: {str(e)}")


@app.get("/api/download-cli")
async def download_cli():
    """Create a ZIP of the diskwise CLI folder and serve it for download."""
    import tempfile
    import shutil
    import os
    
    # Get the project root (where diskwise folder lives)
    # __file__ is /.../diskwise/api/main.py
    # .parent is /.../diskwise/api
    # .parent.parent is /.../diskwise
    # .parent.parent.parent is /.../
    project_root = Path(__file__).resolve().parent.parent.parent
    diskwise_dir = project_root / "diskwise"
    
    if not diskwise_dir.exists():
        # Fallback for different execution contexts
        diskwise_dir = Path(__file__).resolve().parent.parent
        project_root = diskwise_dir.parent
        
    if not diskwise_dir.exists() or diskwise_dir.name != "diskwise":
        raise HTTPException(status_code=404, detail=f"CLI source folder not found at {diskwise_dir}")

    try:
        # Create a persistent temp file for the zip
        tmp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        tmp_zip.close()
        
        # Create a staging area to build the ZIP content
        staging_dir = Path(tempfile.mkdtemp())
        
        # 1. Copy the diskwise core folder
        shutil.copytree(diskwise_dir, staging_dir / "diskwise")
        
        # 2. Add launch scripts if they exist in project root
        launch_files = ["launch.bat", "launch_mac.command", "requirements.txt"]
        for f in launch_files:
            src = project_root / f
            if src.exists():
                shutil.copy2(src, staging_dir / f)
        
        # 3. Add assets (for the icon)
        assets_src = project_root / "assets"
        if assets_src.exists():
            shutil.copytree(assets_src, staging_dir / "assets")

        # Create the archive from the staging directory
        shutil.make_archive(tmp_zip.name.replace(".zip", ""), 'zip', staging_dir)
        
        # Cleanup staging
        shutil.rmtree(staging_dir)
        
        return FileResponse(
            tmp_zip.name, 
            filename="diskwise_premium_v2.1.zip", 
            media_type="application/zip"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create enriched download: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
