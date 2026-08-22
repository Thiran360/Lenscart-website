from PIL import Image

def process_image(filepath):
    try:
        img = Image.open(filepath).convert('RGBA')
        datas = img.getdata()
        width, height = img.size
        
        # Simple thresholding instead of flood fill for all eyeglasses
        # We will make light grey pixels (r>180, g>180, b>180) transparent
        new_data = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = datas[y * width + x]
                # If it's a light pixel and not already transparent
                if r > 150 and g > 150 and b > 150 and a > 0:
                    # check if it's grayscale-ish
                    if abs(r-g) < 20 and abs(g-b) < 20 and abs(r-b) < 20:
                        new_data.append((255, 255, 255, 0))
                        continue
                new_data.append((r, g, b, a))
                
        img.putdata(new_data)
        img.save(filepath)
        print(f"Processed {filepath}")
    except Exception as e:
        print(f"Error {filepath}: {e}")

import glob
for f in glob.glob('public/eyeglass*.png'):
    process_image(f)
