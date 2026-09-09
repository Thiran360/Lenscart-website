import json
import re

with open('src/data/products.js', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'id:\s*(\d+),\s*brand:\s*\"([^\"]+)\",\s*name:\s*\"([^\"]+)\",\s*category:\s*\"([^\"]+)\",\s*type:\s*\"([^\"]+)\",\s*gender:\s*\"([^\"]+)\",.*?image:\s*([^\,]+)', content, re.DOTALL)

for m in matches:
    if 'JOHN JACOBS' in m[1].upper() or 'CLASSIC' in m[2].upper() or 'image' in m[6].lower():
        print(m)
