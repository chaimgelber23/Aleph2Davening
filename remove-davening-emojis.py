#!/usr/bin/env python3
"""
Remove all emojis from davening/daven components.
Processes all TypeScript files in src/components/daven and src/components/siddur.
"""

import re
import os

# Files to process
files = [
    'src/components/daven/AmudCue.tsx',
    'src/components/daven/ServiceRehearsalScript.tsx',
    'src/components/daven/ServiceScopeOverview.tsx',
    'src/components/daven/TodaysServicePath.tsx',
    'src/components/daven/AmudPreparation.tsx',
    'src/components/siddur/AmudMode.tsx',
    'src/components/siddur/TefillahPrepSheet.tsx',
    'src/components/siddur/ServiceRoadmap.tsx',
    'src/components/siddur/ServiceCard.tsx',
    'src/components/siddur/PhysicalActionPill.tsx',
]

# Comprehensive emoji pattern - matches most emoji ranges
emoji_pattern = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed characters
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # extended symbols
    "\U00002600-\U000026FF"  # miscellaneous symbols
    "\U00002700-\U000027BF"  # dingbats
    "\U0000231A-\U0000231B"  # watches
    "\U000023E9-\U000023FA"  # av symbols
    "\U00002B00-\U00002BFF"  # miscellaneous symbols and arrows
    "]+",
    flags=re.UNICODE
)

def remove_emojis(text):
    """Remove all emojis from text, including trailing spaces."""
    # Remove emojis (including trailing spaces)
    text = emoji_pattern.sub('', text)
    return text

def process_file(filepath):
    """Process a single file to remove emojis."""
    if not os.path.exists(filepath):
        print(f"[!] File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = remove_emojis(content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[+] Removed emojis from {filepath}")
        return True
    else:
        print(f"[ ] No emojis found in {filepath}")
        return False

def main():
    print("Removing all emojis from davening components...\n")

    updated = 0
    for filepath in files:
        if process_file(filepath):
            updated += 1

    print(f"\n[+] Complete! Updated {updated} files.")

if __name__ == '__main__':
    main()
