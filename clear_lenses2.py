from PIL import Image
import glob

def process_image(filepath):
    try:
        img = Image.open(filepath).convert('RGBA')
        datas = img.getdata()
        width, height = img.size
        
        new_data = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = datas[y * width + x]
                # Target the greyish lens reflections
                if r > 60 and g > 60 and b > 60 and a > 0:
                    if abs(r-g) < 30 and abs(g-b) < 30 and abs(r-b) < 30:
                        new_data.append((255, 255, 255, 0))
                        continue
                new_data.append((r, g, b, a))
                
        img.putdata(new_data)
        img.save(filepath)
        print(f"Processed {filepath}")
    except Exception as e:
        print(f"Error {filepath}: {e}")

for f in glob.glob('public/kids*.png'):
    process_image(f)
