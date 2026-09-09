import os
from rembg import remove
from PIL import Image

# Path to the public folder
public_dir = 'public'

# Images that need background removal
images_to_process = [
    'bold_square.jpg',
    'golden_aviator.jpg',
    'half_rim.jpg',
    'metal_oval.jpg',
    'mini_round.jpg',
    'rimless_elegance.jpg',
    'round_tortoise.jpg',
    'round_transparent.jpg',
    'sun1.jpg',
    'sun2.jpg',
    'sun3.avif',
    'sun4.webp',
    'sun5.avif',
    'sun6.jpg',
    'sun7.webp',
    'sun_aviator.jpg',
    'sun_cateye.jpg',
    'sun_round.jpg',
    'sun_square.jpg',
    'sun_wayfarer.jpg',
    'tortoise_square.jpg',
    'ultralight_feather.jpg'
]

def process_image(filename):
    input_path = os.path.join(public_dir, filename)
    
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    # Create output filename by replacing extension with .png
    base_name = os.path.splitext(filename)[0]
    output_filename = f"{base_name}.png"
    output_path = os.path.join(public_dir, output_filename)
    
    print(f"Processing {filename} -> {output_filename} ...")
    
    try:
        input_image = Image.open(input_path)
        
        # Ensure it has an alpha channel for rembg (it usually handles this, but good to be safe)
        if input_image.mode != "RGBA":
            input_image = input_image.convert("RGBA")
            
        output_image = remove(input_image)
        output_image.save(output_path, format="PNG")
        
        print(f"Successfully saved {output_filename}")
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    print("Starting background removal...")
    for filename in images_to_process:
        process_image(filename)
    print("Done!")
