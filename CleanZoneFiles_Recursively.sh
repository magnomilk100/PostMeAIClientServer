#!/bin/bash

# Recursively remove Zone.Identifier ADS or leftover files
echo "🔍 Scanning recursively for Zone.Identifier files..."

# Remove files with the .Zone.Identifier suffix (common in extracted ZIPs or NTFS metadata)
find . -type f -name '*Zone.Identifier' -exec echo "🗑️ Removing: {}" \; -exec rm -f "{}" \;

# Attempt to use 'streams' if running on a system with NTFS-3G (for actual ADS)
if command -v streams &> /dev/null; then
  echo "⚙️ Checking for NTFS alternate data streams (ADS)..."
  find . -type f -exec streams -d {} \\; 2>/dev/null
fi

echo "✅ Cleanup complete!"