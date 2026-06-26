import os
import re

reverse_mapping = {
    '1': 'xs',
    '2': 'sm',
    '4': 'md',
    '6': 'lg',
    '8': 'xl',
    '12': '2xl',
    '16': '3xl',
    '24': '4xl'
}

prefixes = ['max-w', 'min-w', 'max-h', 'min-h']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    for prefix in prefixes:
        for old, new in reverse_mapping.items():
            pattern = r'\b' + prefix + r'-' + old + r'\b'
            replacement = prefix + '-' + new
            content = re.sub(pattern, replacement, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Reverted {filepath}")

def main():
    for root, dirs, files in os.walk('frontend'):
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
