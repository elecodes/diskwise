"""
CLI entry point for Diskwise.

Provides a command-line interface for scanning and analyzing disk usage
with a focus on safety and clarity.
"""

import argparse
import sys
import shutil
from pathlib import Path
from typing import List

# Internal imports
from infra.scanner import scan_path, sanitize_path, get_file_category
from core.rules import determine_safety_status
from core.models import FileMetadata


def format_size(size_bytes: int) -> str:
    """Format bytes as human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:3.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:3.1f} PB"


def print_header(text: str):
    """Print a decorated header."""
    print(f"\n{'='*60}")
    print(f" {text}")
    print(f"{'='*60}")


def run_scan(args):
    """Execution logic for the 'scan' command."""
    try:
        target_path = sanitize_path(args.path)
    except ValueError as e:
        print(f"Error: {e}")
        return

    print_header(f"Scanning: {target_path}")
    print(f"Max Depth: {args.max_depth}")
    print("-" * 60)

    # Check for Python once
    python_installed = shutil.which("python") is not None or shutil.which("python3") is not None

    total_size = 0
    safe_size = 0
    warning_size = 0
    items_count = 0
    
    candidates = []

    for metadata in scan_path(target_path, max_depth=args.max_depth):
        items_count += 1
        total_size += metadata.size
        
        status = determine_safety_status(metadata, python_installed)
        category = get_file_category(metadata.path)
        
        if status == "safe":
            safe_size += metadata.size
            if metadata.size > (1024 * 1024):  # Only list "safe" items > 1MB to avoid clutter
                candidates.append((metadata, status, category))
        elif status == "warning":
            warning_size += metadata.size
            if metadata.size > (10 * 1024 * 1024): # List warnings > 10MB
                candidates.append((metadata, status, category))

    # Sort candidates by size
    candidates.sort(key=lambda x: x[0].size, reverse=True)

    if not candidates:
        print("No significant cleanup targets found.")
    else:
        print(f"{'NAME':<30} {'SIZE':<10} {'STATUS':<10} {'CATEGORY'}")
        print("-" * 60)
        for metadata, status, category in candidates[:20]: # Show top 20
            name = metadata.name
            if len(name) > 28:
                name = name[:25] + "..."
            print(f"{name:<30} {format_size(metadata.size):<10} {status:<10} {category}")
        
        if len(candidates) > 20:
            print(f"... and {len(candidates) - 20} more items.")

    print("-" * 60)
    print(f"Total Scanned: {items_count} items ({format_size(total_size)})")
    print(f"Safe to Delete: {format_size(safe_size)}")
    print(f"Needs Review:   {format_size(warning_size)}")
    
    if args.dry_run:
        print("\n[DRY RUN] No files were touched.")
    

def run_check(args):
    """Execution logic for the 'check' command."""
    try:
        target_path = sanitize_path(args.path)
    except ValueError as e:
        print(f"Error: {e}")
        return

    if not target_path.exists():
        print(f"Error: Path '{target_path}' does not exist.")
        return

    python_installed = shutil.which("python") is not None
    is_dir = target_path.is_dir()
    
    if is_dir:
        from infra.scanner import calculate_directory_size
        size = calculate_directory_size(target_path)
    else:
        size = target_path.stat().st_size

    metadata = FileMetadata(path=target_path, name=target_path.name, size=size)
    status = determine_safety_status(metadata, python_installed)
    category = get_file_category(target_path)

    print_header(f"Safety Check: {target_path.name}")
    print(f"Full Path: {target_path}")
    print(f"Type:      {'Directory' if is_dir else 'File'}")
    print(f"Category:  {category}")
    print(f"Size:      {format_size(size)}")
    print(f"Status:    {status.upper()}")
    print("-" * 60)
    
    if status == "safe":
        print("Recommendation: Likely safe to delete. Reclaim space.")
    elif status == "warning":
        print("Recommendation: Exercise caution. Review contents before deleting.")
    elif status == "danger":
        print("Recommendation: DO NOT DELETE. This appears to be a system path.")
    else:
        print("Recommendation: Unknown risk. Manual review required.")


def main():
    parser = argparse.ArgumentParser(
        description="Diskwise - Safe Disk Cleanup CLI",
        epilog="Priority is safety: always use --dry-run for risky operations."
    )
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Scan command
    scan_parser = subparsers.add_parser("scan", help="Scan directory for cleanup targets")
    scan_parser.add_argument("--path", "-p", default="~", help="Directory to scan (default: ~)")
    scan_parser.add_argument("--max-depth", "-d", type=int, default=2, help="Max recursion depth (default: 2)")
    scan_parser.add_argument("--dry-run", action="store_true", help="Preview actions without making changes")

    # Check command
    check_parser = subparsers.add_parser("check", help="Check safety status of a specific path")
    check_parser.add_argument("path", help="Path to check")

    args = parser.parse_args()

    if args.command == "scan":
        run_scan(args)
    elif args.command == "check":
        run_check(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
