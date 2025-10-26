#!/usr/bin/env python3
"""
Add AGPL v3 headers to Codex7 source files

This script adds copyright and license headers to TypeScript source files
that don't already have them.
"""

import os
import re
from pathlib import Path
from typing import List

# AGPL v3 header template
AGPL_HEADER = """/**
 * Codex7 - {description}
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"""

# File descriptions based on package/path
FILE_DESCRIPTIONS = {
    "packages/shared": "Shared Types, Models, and Utilities",
    "packages/mcp-server": "MCP Server Implementation",
    "packages/api": "REST API Server",
    "packages/web": "Web Dashboard",
    "packages/indexer": "Documentation Indexing Service",
    "packages/storage-postgres": "PostgreSQL Storage Adapter",
    "packages/storage-sqlite": "SQLite Storage Adapter",
    "packages/storage-qdrant": "Qdrant Storage Adapter",
}

# Directories to skip
SKIP_DIRS = {
    "node_modules",
    "lib",
    "dist",
    "build",
    ".git",
    "coverage",
    "__pycache__",
    ".next",
    ".cache",
}

# Files to skip
SKIP_FILES = {
    ".d.ts",  # TypeScript declaration files (generated)
    ".test.ts",
    ".test.tsx",
    ".spec.ts",
    ".spec.tsx",
    "vitest.config.ts",
    "vite.config.ts",
    "tsconfig.json",
}


def should_skip_file(file_path: Path) -> bool:
    """Check if file should be skipped"""
    # Skip if in skip directory
    for skip_dir in SKIP_DIRS:
        if skip_dir in file_path.parts:
            return True

    # Skip if matches skip pattern
    for skip_pattern in SKIP_FILES:
        if file_path.name.endswith(skip_pattern):
            return True

    return False


def already_has_header(content: str) -> bool:
    """Check if file already has AGPL header"""
    return "GNU Affero General Public License" in content or "AGPL" in content[:500]


def get_file_description(file_path: Path, project_root: Path) -> str:
    """Get description for the file based on its location"""
    relative = file_path.relative_to(project_root)

    for path_prefix, description in FILE_DESCRIPTIONS.items():
        if str(relative).startswith(path_prefix):
            return description

    return "Truly Open Source Documentation MCP Server"


def add_header_to_file(file_path: Path, project_root: Path, dry_run: bool = False) -> bool:
    """Add AGPL header to a TypeScript file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has header
        if already_has_header(content):
            return False

        # Get description
        description = get_file_description(file_path, project_root)

        # Create header
        header = AGPL_HEADER.format(description=description)

        # Preserve shebang if present
        if content.startswith('#!'):
            lines = content.split('\n', 1)
            new_content = lines[0] + '\n' + header + (lines[1] if len(lines) > 1 else '')
        else:
            new_content = header + content

        if dry_run:
            print(f"[DRY RUN] Would add header to: {file_path.relative_to(project_root)}")
            return True

        # Write file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✅ Added header to: {file_path.relative_to(project_root)}")
        return True

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False


def find_source_files(root_dir: Path) -> List[Path]:
    """Find all TypeScript source files"""
    source_files = []

    for file_path in root_dir.rglob("*.ts"):
        if not should_skip_file(file_path):
            source_files.append(file_path)

    for file_path in root_dir.rglob("*.tsx"):
        if not should_skip_file(file_path):
            source_files.append(file_path)

    return sorted(source_files)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Add AGPL v3 headers to Codex7 source files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    args = parser.parse_args()

    # Find project root (directory containing this script's parent)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    print(f"🔍 Scanning for TypeScript files in: {project_root}")
    print()

    # Find all source files
    source_files = find_source_files(project_root)

    print(f"📝 Found {len(source_files)} TypeScript files")
    print()

    if args.dry_run:
        print("🏃 Running in DRY RUN mode - no files will be modified")
        print()

    # Process files
    modified_count = 0
    for file_path in source_files:
        if add_header_to_file(file_path, project_root, dry_run=args.dry_run):
            modified_count += 1

    print()
    print("=" * 60)
    if args.dry_run:
        print(f"✨ Would modify {modified_count} files")
    else:
        print(f"✨ Added headers to {modified_count} files")
    print(f"📊 Total files scanned: {len(source_files)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
