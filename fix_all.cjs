const fs = require('fs');

const path = './src/data/products.js';
let content = fs.readFileSync(path, 'utf8');

// The array starts at `export const products = [` and ends at `];`
let arrStr = content.substring(content.indexOf('['));
// Evaluate it safely? We can't eval easily because it has imports.
// Wait, there is a `customAssetImage` imported. We can replace it with a string for eval.
let safeStr = arrStr.replace(/customAssetImage/g, '"/eyeglass4.png"');
let productsArray = eval(safeStr);

// 1. First 7 eyeglasses
const eyeglassIds = [1, 2, 3, 8, 11, 12, 13];
let count = 1;
for (let id of eyeglassIds) {
    let p = productsArray.find(x => x.id === id);
    if (p) p.image = `/eyeglass${count++}.png`;
}

// 2. Asset Image Lens
let p24 = productsArray.find(x => x.id === 24);
if (p24) p24.image = "/eyeglass4.png";

// 3. Clear Wayfarer
let p16 = productsArray.find(x => x.id === 16);
if (p16) p16.image = "/eyeglass6.png";

// 4. First 14 sunglasses
let sunCount = 1;
for (let p of productsArray) {
    if (p.type === 'sunglasses') {
        if (sunCount <= 14) {
            p.image = `/sunglass${sunCount++}.png`;
        }
    }
}

// 5. Remove unwanted sunglasses: 21, 22, 23, 20
productsArray = productsArray.filter(x => ![20, 21, 22, 23].includes(x.id));

// 6. Kids section
productsArray = productsArray.filter(x => x.category !== 'Kids');
const kidsProducts = [
    {
      id: 901,
      name: "Kids Blue Block Rectangle",
      category: "Kids",
      brand: "Hooper Kids",
      gender: "Unisex",
      shape: "Rectangle",
      size: "S",
      rating: 4.8,
      price: 1100,
      oldPrice: 1500,
      discount: 26,
      image: "/kids1.png",
      description: "Durable and flexible rectangle glasses for kids. Perfect for school and play.",
      colors: ["blue", "black", "red"],
      lensPower: ["-2.00", "-1.50", "-1.00", "-0.50", "0.00", "+0.50", "+1.00"]
    },
    {
      id: 902,
      name: "Lenskart Junior Round",
      category: "Kids",
      brand: "Lenskart Junior",
      gender: "Unisex",
      shape: "Round",
      size: "S",
      rating: 4.9,
      price: 1500,
      oldPrice: 2200,
      discount: 31,
      image: "/kids2.png",
      description: "Super cute round glasses for your little ones. Unbreakable TR90 material.",
      colors: ["red", "blue", "transparent"],
      lensPower: ["-2.50", "-2.00", "-1.50", "-1.00", "-0.50", "0.00", "+0.50", "+1.00", "+1.50"]
    },
    {
      id: 903,
      name: "Hooper Kids Flexible Square",
      category: "Kids",
      brand: "Hooper Kids",
      gender: "Unisex",
      shape: "Square",
      size: "S",
      rating: 4.7,
      price: 1300,
      oldPrice: 2000,
      discount: 35,
      image: "/kids3.png",
      description: "Colorful square glasses that are bendable and safe.",
      colors: ["yellow", "green", "pink"],
      lensPower: ["-2.00", "-1.50", "-1.00", "-0.50", "0.00", "+0.50", "+1.00"]
    },
    {
      id: 904,
      name: "Junior Sporty Aviator",
      category: "Kids",
      brand: "Lenskart Junior",
      gender: "Boys",
      shape: "Aviator",
      size: "S",
      rating: 4.6,
      price: 1600,
      oldPrice: 2500,
      discount: 36,
      image: "/kids4.png",
      description: "Sporty aviators for active kids.",
      colors: ["black", "silver", "blue"],
      lensPower: ["-1.50", "-1.00", "-0.50", "0.00", "+0.50", "+1.00"]
    },
    {
      id: 905,
      name: "Kids Playful Cat Eye",
      category: "Kids",
      brand: "Hooper Kids",
      gender: "Girls",
      shape: "Cat Eye",
      size: "S",
      rating: 4.8,
      price: 1400,
      oldPrice: 2100,
      discount: 33,
      image: "/kids5.png",
      description: "Chic cat eye frames for stylish little girls.",
      colors: ["pink", "purple", "white"],
      lensPower: ["-2.00", "-1.00", "0.00", "+1.00", "+2.00"]
    },
    {
      id: 906,
      name: "Hooper Tiny Oval",
      category: "Kids",
      brand: "Hooper Kids",
      gender: "Unisex",
      shape: "Oval",
      size: "XS",
      rating: 4.9,
      price: 1250,
      oldPrice: 1800,
      discount: 30,
      image: "/kids6.png",
      description: "Tiny oval frames for toddlers. Made from ultra-safe silicone.",
      colors: ["blue", "green", "red"],
      lensPower: ["0.00"]
    }
];
productsArray.push(...kidsProducts);

// Reconstruct file content
let newStr = JSON.stringify(productsArray, null, 2);
// clean up quotes on keys
newStr = newStr.replace(/"([^"]+)":/g, '$1:');
// clean up double quotes around strings? no, standard stringify is fine for arrays

let top = content.substring(0, content.indexOf('export const products = ['));
let finalContent = top + 'export const products = ' + newStr + ';\n';

fs.writeFileSync(path, finalContent);
console.log("Restored and fully updated!");
