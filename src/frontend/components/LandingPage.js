import React from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate for redirection
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate(); // hook to navigate programmatically

  const getStartedClickHandler = () => {
    navigate("/home"); // navigate to the home page of your app
  };

  return (
    <div>
      <header className="main-header">
        {/* ... */}
        <div className="hero-content">
          <h1>Own the Unique, Digitally.</h1>
          <p>
            Dive into the future of digital ownership: Buy, sell, and collect
            unique NFTs with us. Your gateway to the extraordinary awaits!
          </p>
          <button onClick={getStartedClickHandler} className="cta-button">
            Let's get started
          </button>
        </div>
      </header>
      {/* Rest of your landing page content */}
    </div>
  );
};

export default LandingPage;
