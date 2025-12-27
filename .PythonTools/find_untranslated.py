import json
import re
import argparse
from pathlib import Path

def load_blacklist(filepath='scan_blacklist.txt'):
    """
    Load directory exclusions from the blacklist file.

    Args:
        filepath: Path to the blacklist file

    Returns:
        set: Set of directory names to exclude
    """
    exclude_dirs = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Strip trailing slashes to match directory names in path.parts
                    line = line.rstrip('/')
                    exclude_dirs.add(line)
    except FileNotFoundError:
        print(f"Warning: {filepath} not found, using default exclusions.")
        exclude_dirs = {'.git', 'node_modules', '__pycache__', '.vscode'}
    return exclude_dirs

def extract_chinese_phrases(text):
    """Extract Chinese phrases from text."""
    phrases = set()

    # Find sequences of Chinese characters
    chinese_matches = re.findall(r'[\u4e00-\u9fff]+(?:[^\u4e00-\u9fff]*[\u4e00-\u9fff]+)*', text)

    for match in chinese_matches:
        # Clean up the phrase
        phrase = match.strip()
        if len(phrase) > 1:  # Only include phrases with 2+ characters
            phrases.add(phrase)

    return phrases

def scan_codebase_for_chinese(root_path, exclude_dirs=None, force_url=False):
    """
    Scan the codebase for Chinese text.

    Args:
        root_path: Root directory to scan
        exclude_dirs: List of directory names to exclude
        force_url: Whether to include lines containing URLs

    Returns:
        dict: Dictionary mapping filenames to sets of Chinese phrases found in each file
    """
    if exclude_dirs is None:
        exclude_dirs = load_blacklist()

    file_phrases = {}

    for path in Path(root_path).rglob('*'):
        # Skip directories
        if path.is_dir():
            continue

        # Get relative path and check exclusions
        rel_path = path.relative_to(root_path)
        rel_str = rel_path.as_posix()  # Use forward slashes for consistent checking
        if any(rel_str.startswith(excluded.rstrip('/')) for excluded in exclude_dirs):
            continue

        # Skip binary files and certain extensions
        if path.suffix in {'.jpg', '.png', '.gif', '.pdf', '.zip', '.pyc'}:
            continue

        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

                # Find all Chinese-containing lines
                lines = content.split('\n')
                phrases_in_file = set()
                for line in lines:
                    if not force_url and re.search(r'https?://', line):
                        continue
                    # Extract Chinese phrases from the line
                    phrases = extract_chinese_phrases(line)
                    phrases_in_file.update(phrases)

                if phrases_in_file:
                    file_phrases[str(rel_path)] = phrases_in_file

        except Exception as e:
            print(f"\t can't read {e}")
            # Skip files that can't be read
            continue

    return file_phrases

def main():
    parser = argparse.ArgumentParser(description='Find untranslated Chinese phrases in codebase.')
    parser.add_argument('--force-url', action='store_true', help='Include lines containing URLs')
    args = parser.parse_args()

    # Scan codebase for remaining Chinese text
    print("Scanning codebase for remaining Chinese text...")
    file_phrases = scan_codebase_for_chinese('..', force_url=args.force_url)

    # Since translations are empty, all phrases are untranslated
    result = {}
    for file_path, phrases in file_phrases.items():
        result[file_path] = {phrase: "" for phrase in phrases}

    # Write to JSON file
    output_path = 'untranslated.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Untranslated phrases saved to {output_path}")
    print(f"Total files with untranslated phrases: {len(result)}")
    total_phrases = sum(len(phrases) for phrases in result.values())
    print(f"Total untranslated phrases: {total_phrases}")

if __name__ == "__main__":
    main()
