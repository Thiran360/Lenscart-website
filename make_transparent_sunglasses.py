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
    ("sunglass14.jpg", "sunglass14.png")
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
