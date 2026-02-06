"""
FastAPI backend for DiskWise web interface.

Provides REST API endpoints for disk scanning and file analysis.
Delegates logic to infra (I/O) and core (rules) layers.
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        total_size += metadata.size
        
        # Safety analysis
        safety_status = determine_safety_status(metadata, python_installed)
        if safety_status == "safe":
            safe_to_delete_size += metadata.size
        elif safety_status in ["warning", "unknown"] and metadata.path.is_file():
            compressible_size += metadata.size
            
        # Category analysis
        category = get_file_category(metadata.path)
        category_sizes[category] = category_sizes.get(category, 0) + metadata.size
        
        is_dir = metadata.path.is_dir()
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
            category=category,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
