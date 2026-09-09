from rembg import remove
from PIL import Image
import os

files_to_process = [
    ("kids1.jpg", "kids1.png"),
    ("kids2.jpg", "kids2.png"),
    ("kids 3.jpg", "kids3.png"),
    ("kids4.jpg", "kids4.png"),
    ("kids 5.jpg", "kids5.png"),
    ("kids 6.jpg", "kids6.png")
]

for in_file, out_file in files_to_process:
    in_path = os.path.join("public", in_file)
    out_path = os.path.join("public", out_file)
    try:
        if os.path.exists(in_path):
            img = Image.open(in_path)
            out = remove(img)
            out.save(out_path)
            print(f"Fixed {out_file}")
    except Exception as e:
        print(f"Error {in_file}: {e}")
