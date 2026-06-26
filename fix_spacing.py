import os
import re

mapping = {
    'xs': '1',
    'sm': '2',
    'md': '4',
    'lg': '6',
    'xl': '8',
    '2xl': '12',
    '3xl': '16',
    '4xl': '24'
}

prefixes = ['p', 'm', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'gap', 'w', 'h', 'top', 'bottom', 'left', 'right', 'inset', 'space-x', 'space-y']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    for prefix in prefixes:
        for old, new in mapping.items():
            # Replace prefix-old with prefix-new
            # Use word boundaries to avoid replacing inside other words
            pattern = r'\b' + prefix + r'-' + old + r'\b'
            replacement = prefix + '-' + new
            content = re.sub(pattern, replacement, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('frontend'):
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
