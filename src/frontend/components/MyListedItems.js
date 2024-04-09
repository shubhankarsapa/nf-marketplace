import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";

const renderSoldItems = (items) => (
  <>
    <hr
      style={{
        borderTop: "2px solid white",
        opacity: 0.5,
        margin: "10px 0 20px 0",
      }}
    />
    <h2 style={{ color: "rgb(174, 174, 174)" }}>My Sold NFT's</h2>
    <Row xs={1} md={2} lg={4} className="g-4 py-3">
      {items.map((item, idx) => (
        <Col key={idx} className="overflow-hidden">
          <Card className="custom-card">
            <Card.Img className="card-img" variant="top" src={item.image} />
            <Card.Footer className="card-footer">
              For {ethers.utils.formatEther(item.totalPrice)} ETH - Received{" "}
              {ethers.utils.formatEther(item.price)} ETH
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const fetchNFTData = async (item) => {
    const uri = await nft.tokenURI(item.tokenId);
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  };

  const loadListedItems = async () => {
    setLoading(true);
    if (!account) return setLoading(false);

    const itemCount = await marketplace.itemCount();
    const items = await Promise.all(
      Array.from({ length: itemCount.toNumber() }, (_, i) => i + 1).map(
        async (index) => marketplace.items(index)
      )
    );

    const filteredItems = items.filter(
      (i) => i.seller.toLowerCase() === account
    );
    const itemDetails = await Promise.all(
      filteredItems.map(async (i) => {
        try {
          const metadata = await fetchNFTData(i);
          const totalPrice = await marketplace.getTotalPrice(i.itemId);
          return {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            sold: i.sold,
          };
        } catch (error) {
          console.error("Error loading item data:", error);
          return null; // Filter out failed fetches
        }
      })
    ).then((items) => items.filter((item) => item !== null)); // Remove nulls

    setListedItems(itemDetails.filter((i) => !i.sold));
    setSoldItems(itemDetails.filter((i) => i.sold));
    setLoading(false);
  };

  useEffect(() => {
    loadListedItems();
  }, [marketplace, nft, account]);

  if (!account)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <p className="connect-wallet-message">
          Please login and connect to MetaMask to see your listed items.
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
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2 style={{ color: "rgb(174, 174, 174)" }}>My Listed NFT's</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card className="custom-card">
                  <Card.Img
                    variant="top"
                    src={item.image}
                    className="card-img"
                  />
                  <Card.Footer className="card-footer">
                    <Card.Title className="card-title">{item.name}</Card.Title>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: "1rem 0", color: "white" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}

export default MyListedItems;
