from PIL import Image, ImageChops
import os

images_to_process = [
    ("sun_wayfarer.jpg", "sun_wayfarer.png"),
    ("sun_aviator.jpg", "sun_aviator.png"),
    ("sun_cateye.jpg", "sun_cateye.png"),
    ("sun_round.jpg", "sun_round.png"),
    ("sun_square.jpg", "sun_square.png")
]

public_dir = "c:\\Users\\DELL\\Downloads\\lenskart\\lenskart\\public"

for src_name, dst_name in images_to_process:
    src_path = os.path.join(public_dir, src_name)
    dst_path = os.path.join(public_dir, dst_name)
    
    if not os.path.exists(src_path):
        print(f"Skipping {src_name} - not found")
        continue
        
    print(f"Processing {src_name}...")
    img = Image.open(src_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If pixel is close to pure white, make it transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Crop automatic margins (bbox)
    bg = Image.new(img.mode, img.size, (255, 255, 255, 0))
    diff = ImageChops.difference(img, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Add clean padding
    padding = 20
    new_size = (img.width + padding * 2, img.height + padding * 2)
    new_img = Image.new("RGBA", new_size, (255, 255, 255, 0))
    new_img.paste(img, (padding, padding))
    
    new_img.save(dst_path, "PNG")
    print(f"Saved transparent PNG to {dst_name}")
    
print("Done!")
