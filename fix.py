import os, glob, re

for filepath in glob.glob('backend/app/**/*.py', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace $ with ₹ in format strings and printed strings
    # We want to replace '$' if it's followed by '{' or a number or ' '
    new_content = re.sub(r'\$(?=\{)', '₹', content)
    new_content = re.sub(r'\$(\d+)', r'₹\1', new_content)
    # Special cases in numeric_validator
    new_content = new_content.replace(r'\$[\d,]+', r'₹[\d,]+')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated ' + filepath)
