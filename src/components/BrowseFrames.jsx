import { Link } from "react-router-dom";
import "./BrowseFrames.css";

const frames = [
  { name: "Aviator", path: "?shape=aviator", image: "/frame-image1.jpg", fakeBg: false },
  { name: "Wayfarer", path: "?shape=wayfarer", image: "/frame-image2.webp", fakeBg: false },
  { name: "Round", path: "?shape=round", image: "/frame-image3.avif", fakeBg: true },
  { name: "Rectangle", path: "?shape=rectangle", image: "/frame-image4.png", fakeBg: true },
  { name: "Hexagon", path: "?shape=hexagon", image: "/frame-image5.webp", fakeBg: false }
];

function BrowseFrames() {
  return (
    <section className="browse-frames-section">
      <div className="static-title-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', marginBottom: '20px', width: '100%' }}>
        <h2 className="home-section-title">
          Select Your Frame Shape
        </h2>
      </div>
      <div className="container">
        <div className="frames-grid">
          {frames.map((frame, index) => (
            <Link to={`/products${frame.path}`} className="frame-card" key={index}>
              <div className={`frame-icon ${frame.fakeBg ? 'remove-fake-bg' : ''}`}>
                <img src={frame.image} alt={frame.name} className="frame-image" />
              </div>
              <h3 className="frame-name">{frame.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrowseFrames;
