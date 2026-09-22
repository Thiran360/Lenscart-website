import React from 'react';
import Footer from '../components/Footer';
import './ReturnPolicy.css';

function ReturnPolicy() {
  return (
    <div className="policy-page-wrapper">
      <div className="policy-container">
        
        {/* Header Section */}
        <div className="policy-header-section">
          <div className="policy-logo-wrapper">
            {/* Using a placeholder text for logo to match the PDF vibe */}
            <h1 className="policy-brand-name">Mr. LensMaker</h1>
            <p className="policy-brand-tagline">CRAFTING BETTER VISION</p>
          </div>
          <h1 className="policy-main-title">RETURN, EXCHANGE & WARRANTY POLICY</h1>
          <p className="policy-subtitle">Mr. LensMaker wants you to shop with complete peace of mind.</p>
        </div>

        {/* Intro */}
        <div className="policy-intro">
          <p>
            We understand that buying eyewear online can sometimes feel uncertain. That is why we offer <strong>Free Returns, Free Exchanges, and a 365-Day Product Warranty</strong> on eligible products.
          </p>
          <p>
            This policy clearly explains what is covered, what is not covered, and how to make a return, exchange, or warranty claim.
          </p>
        </div>

        {/* 1. Prescription Eyeglasses */}
        <section className="policy-section">
          <h2>1. Prescription Eyeglasses</h2>
          <p>Prescription eyeglasses are eligible for a <strong>4 Days Free Return</strong> and a <strong>14-Day Free Exchange</strong>, subject to the conditions and exclusions in this policy.</p>
          
          <h3>4 Days Free Return — No Questions Asked</h3>
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
          
          <h3>14-Day Free Exchange</h3>
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

        {/* 2. Sunglasses, Zero-Power Eyeglasses & Accessories */}
        <section className="policy-section">
          <h2>2. Sunglasses, Zero-Power Eyeglasses & Accessories</h2>
          <p>Sunglasses, zero-power/non-prescription eyeglasses, and eligible accessories are covered by a <strong>7-Day Free Return — No Questions Asked</strong>.</p>
          <p>You may request a return within <strong>7 calendar days from the date of delivery</strong>, without providing a reason.</p>
          <ul>
            <li>Be completely unused and unworn.</li>
            <li>Have all original tags and labels intact.</li>
            <li>Include the original packaging and accessories.</li>
            <li>Be free from scratches, marks, stains, damage, alterations, or modifications.</li>
            <li>Pass our inspection.</li>
          </ul>
          <p className="policy-highlight"><strong>Mr. LensMaker will bear the return shipping or pickup cost for an eligible and approved return.</strong></p>
          <p><strong>No exchange is offered for sunglasses, zero-power eyeglasses, or accessories.</strong></p>
        </section>

        {/* 3. Products Not Eligible for Return or Exchange */}
        <section className="policy-section">
          <h2>3. Products Not Eligible for Return or Exchange</h2>
          <p>The following products are <strong>not eligible for return or exchange</strong>, even if they are within the standard return or exchange period:</p>
          <ul>
            <li><strong>Bifocal lenses</strong></li>
            <li><strong>Progressive lenses</strong></li>
            <li><strong>Prescription lenses with power above +6.00D or below -6.00D</strong></li>
          </ul>
          <p>These products cannot be returned or exchanged under the standard return and exchange policy.</p>
          <p>Warranty coverage, where applicable, remains subject to the separate <strong>365-Day Product Warranty</strong> and its eligibility requirements.</p>
        </section>

        {/* 4. Buy One Get One (BOGO) Purchases */}
        <section className="policy-section">
          <h2>4. Buy One Get One (BOGO) Purchases</h2>
          <p>A BOGO purchase is treated as <strong>one promotional transaction</strong>.</p>
          <ul>
            <li>All products received under the BOGO offer must be returned together.</li>
            <li>You cannot return only one product from the BOGO offer for a partial refund.</li>
            <li>No refund will be provided for only one item from a BOGO purchase.</li>
            <li>Any eligible refund will be calculated based on the <strong>amount actually paid for the BOGO transaction</strong>.</li>
            <li>All standard return conditions must be satisfied.</li>
          </ul>
          <h3>BOGO Warranty</h3>
          <p>The 365-Day Product Warranty applies independently to each individual product purchased under a BOGO offer, subject to the warranty coverage and exclusions in this policy.</p>
        </section>

        {/* 5. Cash on Delivery (COD) Orders */}
        <section className="policy-section">
          <h2>5. Cash on Delivery (COD) Orders</h2>
          <p>COD orders are eligible for the same applicable return periods and conditions described in this policy.</p>
          <p>However, <strong>COD orders are not eligible for monetary refunds</strong>.</p>
          <ul>
            <li>The eligible refund amount will be issued as <strong>Mr. LensMaker Store Credit</strong>.</li>
            <li>Store Credit will be issued only after the returned product is received and successfully inspected.</li>
            <li>Store Credit can be used toward a future purchase on the Mr. LensMaker website.</li>
            <li>No cash, bank transfer, UPI, credit card, or debit card refund will be provided for COD orders.</li>
          </ul>
          <h3>COD + BOGO</h3>
          <ul>
            <li>All products received under the BOGO offer must be returned together.</li>
            <li>Partial returns are not eligible for a refund.</li>
            <li>Any eligible refund will be provided <strong>only as Mr. LensMaker Store Credit</strong>.</li>
            <li>No monetary refund will be provided.</li>
          </ul>
        </section>

        {/* 6. 365-Day Product Warranty */}
        <section className="policy-section">
          <h2>6. 365-Day Product Warranty</h2>
          <p><strong>Mr. LensMaker provides a 365-Day Product Warranty from the date of delivery</strong> against specific manufacturing or material-related defects listed below.</p>
          
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
          
          <h3>How We Resolve a Warranty Issue</h3>
          <p><strong>Every warranty claim is subject to review, verification, and approval by Mr. LensMaker. Submitting a warranty claim does not guarantee approval.</strong></p>
          <p>A claim will be approved only if, after reviewing and inspecting the product, we determine that the reported issue is a <strong>covered manufacturing or material-related defect specifically listed in this policy</strong>.</p>
          <p><strong>Approval of a warranty claim does not guarantee replacement. The warranty provides repair or replacement only, at the sole discretion of Mr. LensMaker. It does not provide a monetary refund.</strong></p>
          <p>Depending on the nature of the approved warranty issue, we may:</p>
          <ul>
            <li>Repair or fix the affected product; or</li>
            <li>Replace the affected frame or lens.</li>
          </ul>
          <p><strong>Frame replacement is subject to availability.</strong></p>
          <p>If the original frame is unavailable, Mr. LensMaker will determine the appropriate resolution based on the nature of the approved warranty claim.</p>
        </section>

        {/* 7. Warranty Exclusions */}
        <section className="policy-section">
          <h2>7. Warranty Exclusions</h2>
          <p>The 365-Day Product Warranty does <strong>not</strong> cover:</p>
          <div className="policy-two-cols">
            <ul>
              <li>Frame breakage</li>
              <li>Lens breakage</li>
              <li>Cracked lenses</li>
              <li>Chipped lenses or lens chipping</li>
              <li>Scratches on lenses</li>
              <li>Scratches on frames</li>
              <li>Fitment-related issues</li>
              <li>Size-related issues</li>
            </ul>
            <ul>
              <li>Changes in eye power or prescription</li>
              <li>Accidental damage</li>
              <li>Normal wear and tear</li>
              <li>Damage caused by misuse</li>
              <li>Damage caused by improper handling</li>
              <li>Damage caused by external causes</li>
              <li>Any issue not specifically listed under <strong>What Our Warranty Covers</strong></li>
            </ul>
          </div>
          <p>If an issue is not specifically listed as a covered warranty defect, it is not covered under the 365-Day Product Warranty.</p>
        </section>

        {/* 8. Accidental Damage */}
        <section className="policy-section">
          <h2>8. Accidental Damage</h2>
          <p><strong>Accidental damage is not covered under our Return, Exchange, or 365-Day Product Warranty.</strong></p>
          <p>This includes, but is not limited to:</p>
          <div className="policy-two-cols">
            <ul>
              <li>Dropping the product</li>
              <li>Impact or collision</li>
              <li>Crushing</li>
              <li>Bending due to accidental force</li>
              <li>Breaking due to accidental force</li>
            </ul>
            <ul>
              <li>Mishandling</li>
              <li>Damage caused by external objects</li>
              <li>Damage caused by any accidental or external force</li>
            </ul>
          </div>
          <p>Products damaged accidentally are not eligible for a free return, free exchange, or warranty repair or replacement.</p>
        </section>

        {/* 9. Warranty Claim Process */}
        <section className="policy-section">
          <h2>9. Warranty Claim Process</h2>
          <p>To make a warranty claim:</p>
          <ol>
            <li>Email us at <strong>care@mrlensmaker.com</strong> from the <strong>registered email address associated with your order</strong>.</li>
            <li>Include your <strong>Order ID</strong>.</li>
            <li>Provide clear photographs showing the reported issue or defect.</li>
            <li>Our Customer Service Specialist will review the information and guide you through the claim process.</li>
            <li>If the claim is approved, you will be asked to ship the product to our designated Mr. LensMaker warehouse.</li>
            <li>Our team will inspect the product and determine the appropriate warranty resolution.</li>
            <li>If approved for repair or replacement, the product will be serviced accordingly and shipped back to you.</li>
          </ol>
          
          <h3>Warranty Shipping</h3>
          <p>If your warranty claim is approved:</p>
          <ul>
            <li><strong>You are responsible for the shipping cost of sending the product to our designated warehouse.</strong></li>
            <li><strong>Mr. LensMaker will bear the shipping cost of sending the repaired or replacement product back to you.</strong></li>
          </ul>
          
          <h3>Warranty Inspection & Resolution Time</h3>
          <p>Once we receive your product at our designated warehouse, our team will inspect and verify the warranty issue.</p>
          <p><strong>We aim to complete the inspection and communicate the warranty resolution within 24–48 hours of receiving the product.</strong></p>
          <p>All warranty claims are subject to verification and approval.</p>
        </section>

        {/* 10. Product Condition for Returns & Exchanges */}
        <section className="policy-section">
          <h2>10. Product Condition for Returns & Exchanges</h2>
          <p>All returned and exchanged products are subject to inspection.</p>
          <p>A return or exchange may be rejected if the product:</p>
          <div className="policy-two-cols">
            <ul>
              <li>Has been worn or used.</li>
              <li>Shows visible signs of wear.</li>
              <li>Has scratches, stains, marks, or damage.</li>
              <li>Has missing, removed, altered, or damaged tags or labels.</li>
              <li>Is missing original packaging or accessories.</li>
            </ul>
            <ul>
              <li>Has been modified or altered after delivery.</li>
              <li>Has suffered accidental or external damage.</li>
              <li>Is not returned in substantially the same condition in which it was delivered.</li>
            </ul>
          </div>
          <p>Eligibility for a return or exchange is confirmed only after the product passes our inspection.</p>
        </section>

        {/* 11. How to Request a Return or Exchange */}
        <section className="policy-section">
          <h2>11. How to Request a Return or Exchange</h2>
          <p>Please raise your return or exchange request within the applicable period mentioned in this policy.</p>
          <p>Requests made after the applicable return or exchange period has expired will not be eligible.</p>
          <p>When contacting us, please provide:</p>
          <ul>
            <li>Your Order ID</li>
            <li>Registered email address or contact details</li>
            <li>Reason for the request, where applicable</li>
            <li>Clear photographs, if requested by our Customer Service team</li>
          </ul>
          <p>Our team will review your request and guide you through the next steps.</p>
        </section>

        {/* Quick Summary */}
        <section className="policy-section">
          <h2>Quick Summary</h2>
          <div className="policy-table-wrapper">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Product Category</th>
                  <th>Return</th>
                  <th>Exchange</th>
                  <th>Warranty</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Prescription Eyeglasses*</td>
                  <td><strong>4 Days Free Return</strong></td>
                  <td><strong>14-Day Free Exchange</strong></td>
                  <td><strong>365 Days</strong></td>
                </tr>
                <tr>
                  <td>Sunglasses</td>
                  <td><strong>7-Day Free Return</strong></td>
                  <td>—</td>
                  <td><strong>365 Days</strong></td>
                </tr>
                <tr>
                  <td>Zero-Power Eyeglasses</td>
                  <td><strong>7-Day Free Return</strong></td>
                  <td>—</td>
                  <td><strong>365 Days</strong></td>
                </tr>
                <tr>
                  <td>Accessories</td>
                  <td><strong>7-Day Free Return</strong></td>
                  <td>—</td>
                  <td><strong>365 Days</strong></td>
                </tr>
                <tr>
                  <td>Bifocal Lenses</td>
                  <td>No Return</td>
                  <td>No Exchange</td>
                  <td>Subject to warranty eligibility</td>
                </tr>
                <tr>
                  <td>Progressive Lenses</td>
                  <td>No Return</td>
                  <td>No Exchange</td>
                  <td>Subject to warranty eligibility</td>
                </tr>
                <tr>
                  <td>High-Power &gt; +6.00D or &lt; -6.00D</td>
                  <td>No Return</td>
                  <td>No Exchange</td>
                  <td>Subject to warranty eligibility</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="policy-asterisk">* Subject to product condition requirements and exclusions stated in this policy.</p>
          
          <div className="policy-footer-notes">
            <p><strong>All eligible return and exchange shipping/pickup costs are completely free and are borne by Mr. LensMaker.</strong></p>
            <p><strong>COD returns are refunded through Mr. LensMaker Store Credit only.</strong></p>
            <p><strong>All return/exchange periods include the date of delivery as Day 1.</strong><br/>
            Example: Delivered on 3 May — 4 days return window ends at 11:59 PM on 6 May.</p>
            <p><strong>Our 365-Day Product Warranty covers only the specific manufacturing or material-related defects listed in this policy.</strong></p>
            <p><strong>Accidental damage is not covered under our Return, Exchange, or 365-Day Warranty.</strong></p>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}

export default ReturnPolicy;
