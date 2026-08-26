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

def remove_white_bg(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Processed {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

for in_file, out_file in files_to_process:
    remove_white_bg(os.path.join("public", in_file), os.path.join("public", out_file))
