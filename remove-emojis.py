#!/usr/bin/env python3
"""Remove emoji icons from guides.ts"""
import re

# Read the file
with open('src/lib/content/guides.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all icon: 'emoji', with icon: '', // Removed emoji
# Match any non-empty icon field
pattern = r"icon: '[^']+?',"
replacement = "icon: '', // Removed emoji"

new_content = re.sub(pattern, replacement, content)

# Write back
with open('src/lib/content/guides.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully removed all emoji icons!")
