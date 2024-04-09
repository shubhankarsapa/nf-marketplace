import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const fetchNFTMetadata = async (uri) => {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const metadata = await response.json();
    if (!metadata) throw new Error("Failed to load NFT metadata");
    return metadata;
  };

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    const loadedItems = [];

    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        try {
          const metadata = await fetchNFTMetadata(
            await nft.tokenURI(item.tokenId)
          );
          const totalPrice = await marketplace.getTotalPrice(item.itemId);

          loadedItems.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          });
        } catch (error) {
          console.error("Could not fetch NFT metadata:", error);
        }
      }
    }

    setItems(loadedItems.reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  const handleBuyMarketItem = async (item) => {
    await marketplace
      .purchaseItem(item.itemId, { value: item.totalPrice })
      .wait();
    loadMarketplaceItems();
  };

  const renderMarketItems = () =>
    items
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .map((item, idx) => (
        <Col key={idx} className="overflow-hidden">
          <Card className="custom-card">
            <Card.Img variant="top" src={item.image} className="card-img" />
            <Card.Body className="card-body">
              <Card.Title className="card-title">{item.name}</Card.Title>
              <Card.Text className="card-text">{item.description}</Card.Text>
            </Card.Body>
            <Card.Footer className="card-footer">
              <div className="d-grid">
                <Button
                  onClick={() => handleBuyMarketItem(item)}
                  size="lg"
                  className="card-btn"
                >
                  Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      ));

  return (
    <div className="flex justify-center">
      {loading ? (
        <main style={{ padding: "1rem 0", color: "white" }}>
          <h2>Loading... </h2>
        </main>
      ) : (
        <>
          {items.length > 0 && (
            <div
              className="search-bar-container"
              style={{ textAlign: "center", margin: "20px" }}
            >
              <input
                className="search-bar"
                type="text"
                placeholder="Search NFTs"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="px-5 container">
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {renderMarketItems()}
            </Row>
          </div>
          {items.length === 0 && (
            <main style={{ padding: "1rem 0", color: "white" }}>
              <h2>No listed assets</h2>
            </main>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
