import React from "react";
import { useNavigate } from "react-router-dom";
import Navbarr from "../Navbarr/Navbarr";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const plainlot = () => {
    navigate("/plainlot");
  };

  const beadsEnamellot = () => {
    navigate("/beadsenamellot");
  };

  return (
    <>
      <Navbarr />
      <div className="home-root">
        <div className="home-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome to Manohar Jewelry</h1>
            <p className="welcome-subtitle">Select your product category to continue</p>
          </div>

          <div className="lot-container">
            <div className="lot-card plain-lot" onClick={plainlot}>
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="12" cy="12" r="5"/>
                </svg>
              </div>
              <h2 className="card-title">Plain Lot</h2>
              <p className="card-description">Manage plain jewelry items and collections</p>
              <div className="card-arrow">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </div>
            </div>

            <div className="lot-card beadsenamel-lot" onClick={beadsEnamellot}>
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2 className="card-title">Stone & Enamel Lot</h2>
              <p className="card-description">Manage stone and enamel jewelry products</p>
              <div className="card-arrow">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* <div className="features-section">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Easy Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Quick Access</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Organized System</span>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Home;
