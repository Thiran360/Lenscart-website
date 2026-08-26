from rembg import remove
from PIL import Image
import os

files_to_process = [
    ("sunglass1.jpg", "sunglass1.png"),
    ("sunglass2.jpg", "sunglass2.png"),
    ("sunglass 3.jpg", "sunglass3.png"),
    ("sunglass 4.jpg", "sunglass4.png"),
    ("sunglass 5.jpg", "sunglass5.png"),
    ("sunglasss 6.jpg", "sunglass6.png"),
    ("sunglass 7.jpg", "sunglass7.png"),
    ("sunglass8.jpg", "sunglass8.png"),
    ("sunglass9.jpg", "sunglass9.png"),
    ("sunglass10.jpg", "sunglass10.png"),
    ("sunglass 11.jpg", "sunglass11.png"),
    ("sunglas12.jpg", "sunglass12.png"),
    ("sunglass13.jpg", "sunglass13.png"),
    ("sunglass14.jpg", "sunglass14.png"),
    ("eyeglass1.jpg", "eyeglass1.png"),
    ("eyeglass2.jpg", "eyeglass2.png"),
    ("eyeglass3.jpg", "eyeglass3.png"),
    ("eyeglass4.jpg", "eyeglass4.png"),
    ("eyeglass5.jpg", "eyeglass5.png"),
    ("eyeglass 6.jpg", "eyeglass6.png"),
    ("eyeglass7.jpg", "eyeglass7.png"),
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
