#!/usr/bin/env python3
"""
Translation Application Script

Applies Chinese→English translations from untranslated.json to files in the codebase.

Usage:
    python apply_translations.py

This script reads untranslated.json and applies the translations per file,
sorting translations by length descending to avoid short key interference.
"""

import json
import re
from pathlib import Path

# Characters adjacent to which spaces should not be added
NO_SPACE_CHARS = '\'"`_-+*\\=.\n|<>][]}{)('

def load_translations():
    """Load the translations from untranslated.json."""
    try:
        with open('untranslated.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("untranslated.json not found. Run find_untranslated.py first.")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing untranslated.json: {e}")
        return {}

def apply_translations_to_file(file_path, translations):
    """
    Apply translations to a single file.

    Args:
        file_path: Path to the file
        translations: Dict of Chinese -> English mappings for this file

    Returns:
        bool: True if file was modified
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, OSError):
        # Skip binary files or files that can't be read
        return False

    original_content = content
    modified = False

    # Sort translations by length of Chinese text (longest first) to prevent
    # shorter matches from interfering with longer ones
    sorted_translations = sorted(translations.items(),
                               key=lambda x: len(x[0]), reverse=True)

    def replace_with_spacing(match, english):
        start = match.start()
        end = match.end()
        prefix_space = ''
        suffix_space = ''
        if start > 0 and content[start-1] != ' ' and content[start-1] not in NO_SPACE_CHARS and english and english[0].isalpha() and not english.startswith(' '):
            prefix_space = ' '
        if end < len(content) and content[end] != ' ' and content[end] not in NO_SPACE_CHARS and english and english[-1].isalpha() and not english.endswith(' '):
            suffix_space = ' '
        return prefix_space + english + suffix_space

    for chinese, english in sorted_translations:
        if chinese in content:
            content = re.sub(re.escape(chinese), lambda m: replace_with_spacing(m, english), content)
            modified = True

    if modified and content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except OSError as e:
            print(f"Error writing to {file_path}: {e}")
            return False

    return False

def main():
    print("Loading translations...")
    translations = load_translations()

    if not translations:
        return

    total_files = len(translations)
    print(f"Loaded translations for {total_files} files.")

    # Apply translations per file
    modified_count = 0
    for rel_filename, file_translations in translations.items():
        # Skip if no translations for this file
        if not file_translations:
            continue

        # Construct full path from parent directory
        file_path = Path('..') / rel_filename

        if not file_path.exists():
            print(f"Warning: File {file_path} not found, skipping.")
            continue

        print(f"Processing: {rel_filename} ({len(file_translations)} translations)")
        if apply_translations_to_file(file_path, file_translations):
            modified_count += 1
            print(f"Modified: {rel_filename}")

    print(f"\nTranslation complete!")
    print(f"- Files modified: {modified_count}")
    print(f"- Files processed: {total_files}")

if __name__ == "__main__":
    main()
