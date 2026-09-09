from PIL import Image

img = Image.open('public/eyeglass4.png').convert('RGBA')
datas = img.getdata()
width, height = img.size

new_data = []
for y in range(height):
    for x in range(width):
        r, g, b, a = datas[y * width + x]
        # the white blob is at the bottom, so anything below y=height*0.7 and near the center?
        # let's just remove anything that is very light gray
        if r > 180 and g > 180 and b > 180 and a > 0:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))

img.putdata(new_data)
img.save('public/eyeglass4.png')
print('Fixed eyeglass4.png')
