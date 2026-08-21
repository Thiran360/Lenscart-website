import { Link } from "react-router-dom";
import "./BrowseStyles.css";

const stylesList = [
  { name: "Half Rim", path: "?style=half_rim", image: "/half_rim.png" },
  { name: "Full Rim", path: "?style=full_rim", image: "/classic_rectangle.png" },
  { name: "Rimless", path: "?style=rimless", image: "/rimless_elegance.png" },
  { name: "Wrap Around", path: "?style=wrap_around", image: "/golden_aviator.png" },
  { name: "Oval", path: "?style=oval", image: "/metal_oval.png" }
];

function BrowseStyles() {
  return (
    <section className="browse-styles-section">
      <div className="static-title-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', marginBottom: '20px', width: '100%' }}>
        <h2 className="home-section-title">
          Select Your Frame Style
        </h2>
      </div>
      <div className="container">
        <div className="styles-grid">
          {stylesList.map((style, index) => (
            <Link to={`/products${style.path}`} className="style-card" key={index}>
              <div className="style-icon">
                <img src={style.image} alt={style.name} className="style-image" />
              </div>
              <h3 className="style-name">{style.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrowseStyles;
