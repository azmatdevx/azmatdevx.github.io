#!/bin/bash
# Create a draft post from _templates/post.md.
# Usage: scripts/new-post.sh "My post title"
set -euo pipefail
[ $# -ge 1 ] || { echo "usage: $0 \"Post title\"" >&2; exit 1; }
root=$(cd "$(dirname "$0")/.." && pwd)
title=$1
# quote for YAML, then escape for use in a sed replacement
yaml_title=$(printf '%s' "$title" | sed 's/\\/\\\\/g; s/"/\\"/g' | sed 's/[&|\\]/\\&/g')
slug=$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
file="$root/_posts/$(date +%F)-$slug.md"
[ ! -e "$file" ] || { echo "already exists: $file" >&2; exit 1; }
sed -e "s|^title: TITLE|title: \"$yaml_title\"|" \
    -e "s|^date: DATE|date: $(date '+%F %T %z')|" \
    -e "s|SLUG|$slug|g" "$root/_templates/post.md" > "$file"
echo "created $file"
