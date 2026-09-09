const fs = require('fs');

const path = './src/data/products.js';
let content = fs.readFileSync(path, 'utf8');

const kidsProducts = `    {
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
    }`;

// Replace the existing kids section
const regex = /\{\s*id:\s*901,[\s\S]*\}\s*\];/;
if (regex.test(content)) {
    const newContent = content.replace(regex, kidsProducts + '\n  ];');
    fs.writeFileSync(path, newContent);
    console.log("Successfully replaced kids section.");
} else {
    console.log("Could not find regex match.");
}
