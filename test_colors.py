from PIL import Image
import os

img = Image.open('public/eyeglass1.png').convert('RGBA')
datas = list(img.getdata())
width, height = img.size

# Check the center of the left lens
left_lens_center = datas[int(height*0.5) * width + int(width*0.3)]
right_lens_center = datas[int(height*0.5) * width + int(width*0.7)]
print("Left lens center:", left_lens_center)
print("Right lens center:", right_lens_center)
