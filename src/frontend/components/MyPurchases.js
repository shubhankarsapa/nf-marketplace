import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  // Extracted method to fetch NFT metadata
  const fetchNFTMetadata = async (tokenId) => {
    const uri = await nft.tokenURI(tokenId);
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  };

  const loadPurchasedItems = async () => {
    if (!account || !marketplace || !nft) {
      setLoading(false);
      return;
    }

    const filter = marketplace.filters.Bought(
      null,
      null,
      null,
      null,
      null,
      account
    );
    const results = await marketplace.queryFilter(filter);

    const items = await Promise.all(
      results.map(async (event) => {
        const { tokenId, itemId, price } = event.args;
        const metadata = await fetchNFTMetadata(tokenId);
        const totalPrice = await marketplace.getTotalPrice(itemId);
        return {
          totalPrice,
          price,
          itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
      })
    );

    setPurchases(items);
    setLoading(false);
  };

  useEffect(() => {
    loadPurchasedItems();
  }, [marketplace, nft, account]);

  if (!account)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <p className="connect-wallet-message">
          Please login and connect to MetaMask to see your purchases.
        </p>
      </div>
    );

  if (loading)
    return (
      <main style={{ padding: "1rem 0", color: "white" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((purchase, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="custom-card">
                  <Card.Img
                    variant="top"
                    src={purchase.image}
                    className="card-img"
                  />
                  <Card.Footer className="card-footer">
                    {ethers.utils.formatEther(purchase.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0", color: "white" }}>
          <h2>No purchases</h2>
        </main>
      )}
    </div>
  );
}
