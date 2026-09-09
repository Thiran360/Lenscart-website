with open('src/data/products.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = re.findall(r'name:\s*\"([^\"]+)\"', content)
print(matches)
