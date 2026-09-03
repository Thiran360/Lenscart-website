import { Link } from "react-router-dom";
import "./CategoryCard.css";

function CategoryCard() {
  const reliableUrls = [
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80",
    "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?w=400&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80"
  ];

  const categories = [
    { name: "Eyeglasses", image: reliableUrls[0] },
    { name: "Sunglasses", image: reliableUrls[1] },
    { name: "Computer Glasses", image: reliableUrls[2] },
    { name: "Kids Glasses", image: reliableUrls[3] },
    { name: "Power Sunglasses", image: reliableUrls[1] }
  ];

  const getLinkForCategory = (name) => {
    if (name.includes("Kids")) return "/products?search=kids";
    if (name.includes("Sunglasses")) return "/products?type=sunglasses";
    if (name.includes("Contact")) return "/products?type=contacts";
    return "/products?type=eyeglasses"; // Default for eyeglasses, computer glasses
  };

  return (
    <div className="categories">
      {categories.map((item, index) => (
        <Link 
          to={getLinkForCategory(item.name)} 
          key={index} 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="category-card">
            <img
              src={item.image}
              alt={item.name}
            />
            <h3>{item.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default CategoryCard;