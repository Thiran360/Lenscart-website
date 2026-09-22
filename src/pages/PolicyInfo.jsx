import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './ReturnPolicy.css'; // Reusing the same CSS for consistent styling

function PolicyInfo() {
  const { type } = useParams();

  const renderContent = () => {
    switch (type) {
      case 'return':
        return (
          <section className="policy-section">
            <h2>4 Days Free Return — No Questions Asked</h2>
            <p>You may return your prescription eyeglasses within <strong>4 calendar days from the date of delivery</strong>, without providing a reason.</p>
            <h4>To be eligible:</h4>
            <ul>
              <li>The product must be completely <strong>unused and unworn</strong>.</li>
              <li>All original tags and labels must remain attached and intact.</li>
              <li>The original packaging and all accessories must be returned.</li>
              <li>The product must not have any scratches, marks, stains, damage, alterations, or modifications.</li>
              <li>The returned product must pass our inspection.</li>
            </ul>
            <p>If the product does not meet these conditions, the return may be rejected.</p>
            <p className="policy-highlight"><strong>Mr. LensMaker will bear the return shipping or pickup cost for an eligible and approved return.</strong></p>
          </section>
        );
      
      case 'exchange':
        return (
          <section className="policy-section">
            <h2>14-Day Free Exchange</h2>
            <p>You may request an exchange within <strong>14 calendar days from the date of delivery</strong>.</p>
            <ul>
              <li>An exchange is <strong>not a money-back option</strong>.</li>
              <li>The replacement product must be of the <strong>same or higher value</strong> than the original product.</li>
              <li>If the replacement product has a higher value, you must pay the difference.</li>
              <li>No monetary refund will be provided for an exchange.</li>
              <li>The original product must be completely unused and unworn.</li>
              <li>Original tags, labels, packaging, and accessories must be returned.</li>
              <li>The product must not have scratches, marks, stains, damage, alterations, or modifications.</li>
              <li>The returned product must pass our inspection.</li>
            </ul>
            <p className="policy-highlight"><strong>Mr. LensMaker will bear the return shipping or pickup cost and the applicable shipping cost for the approved exchange.</strong></p>
          </section>
        );

      case 'warranty':
        return (
          <section className="policy-section">
            <h2>365-Day Product Warranty</h2>
            <p><strong>Mr. LensMaker provides a 365-Day Product Warranty from the date of delivery</strong> against specific manufacturing or material-related defects.</p>
            
            <h3>What Our Warranty Covers</h3>
            <p>Our warranty covers <strong>only the following issues</strong>:</p>
            <div className="policy-two-cols">
              <ul>
                <li>Frame discoloration</li>
                <li>Lens discoloration</li>
                <li>Rust on metal frames</li>
                <li>Rust on screws</li>
                <li>Lens coating peeling off</li>
              </ul>
              <ul>
                <li>Spotting on lenses</li>
                <li>Loose nose tip</li>
                <li>Loose frame</li>
                <li>Screw coming out</li>
              </ul>
            </div>
            <p>Only the defects specifically listed above are covered under this warranty.</p>
            
            <h3>Warranty Exclusions</h3>
            <p>Accidental damage, frame/lens breakage, scratches, and normal wear and tear are <strong>not covered</strong>.</p>
            <p className="policy-highlight"><strong>Approval of a warranty claim does not guarantee replacement. The warranty provides repair or replacement only, at the sole discretion of Mr. LensMaker.</strong></p>
          </section>
        );

      default:
        return <p>Policy not found.</p>;
    }
  };

  return (
    <div className="policy-page-wrapper">
      <div className="policy-container" style={{ maxWidth: '700px', marginTop: '60px' }}>
        
        {/* Header Section */}
        <div className="policy-header-section" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '20px' }}>
          <div className="policy-logo-wrapper">
            <h1 className="policy-brand-name">Mr. LensMaker</h1>
            <p className="policy-brand-tagline">CRAFTING BETTER VISION</p>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/return-policy" style={{ color: '#0d707f', textDecoration: 'underline', fontWeight: 'bold' }}>
            View Full Return, Exchange & Warranty Policy
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PolicyInfo;
