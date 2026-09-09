import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>Discover Our Story</h1>
          <p>Innovating vision, one pair of glasses at a time.</p>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section history-section fade-in-up">
          <div className="section-content">
            <h2>Our History</h2>
            <p>
              Founded in 2010, we started with a simple idea: everyone deserves premium eyewear without breaking the bank. Today, we've grown from a small startup into a global leader pushing the boundaries of optical technology and fashion.
            </p>
          </div>
          <div className="section-image history-image"></div>
        </section>

        <section className="about-section vision-mission-section reverse fade-in-up">
          <div className="section-content" style={{width: '100%'}}>
            <h2>Vision & Mission</h2>
            <div className="vm-cards">
              <div className="vm-card">
                <h3>Our Vision</h3>
                <p>Making high-quality, fashionable eyewear accessible to everyone globally.</p>
              </div>
              <div className="vm-card">
                <h3>Our Mission</h3>
                <p>Combining optical technology with cutting-edge fashion to empower customers to see clearly and beautifully.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section experience-section fade-in-up">
          <h2>Our Experience & Milestones</h2>
          <p className="subtitle">Delivering excellence through numbers.</p>
          <div className="stats-container">
            <div className="stat-box">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years of Experience</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">100+</span>
              <span className="stat-label">Retail Stores</span>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default About;
