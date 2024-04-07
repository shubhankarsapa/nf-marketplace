import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import market from "./market.png";

const Navigation = ({ web3Handler, account }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    web3Handler(null); // Handle disconnect or clear the account state
    navigate("/"); // Navigate back to the home page
    window.location.reload(); // Refresh the page to reset application state
  };

  return (
    <Navbar expand="lg" variant="dark" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img
            src={market}
            width="50"
            height="50"
            alt="Market Logo"
            style={{ marginTop: "6px" }}
          />
          &nbsp; MetaMuseum
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/create">
              Create
            </Nav.Link>
            <Nav.Link as={Link} to="/my-listed-items">
              My Listed Items
            </Nav.Link>
            <Nav.Link as={Link} to="/my-purchases">
              My Purchases
            </Nav.Link>
            {account && (
              <Nav.Link
                href={`https://sepolia.etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction History
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {account ? (
              <>
                <Nav.Item className="me-3">
                  <span className="navbar-text">
                    Account: {account.slice(0, 6) + "..." + account.slice(-4)}
                  </span>
                </Nav.Item>
                <Nav.Item>
                  <Button onClick={handleLogout} variant="outline-light">
                    Logout
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <Nav.Item>
                <Button onClick={() => web3Handler()} variant="outline-light">
                  Login
                </Button>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
