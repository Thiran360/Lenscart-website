import re

filepath = 'src/data/products.js'
with open(filepath, 'r') as f:
    content = f.read()

# We want to remove all objects in the array that have `type: "contacts"`
# But parsing JS with python regex is brittle.
# Let's just execute a node script to read the JS array, filter it, and write it back!
