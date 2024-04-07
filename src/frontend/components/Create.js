import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";

const Create = ({ marketplace, nft, account }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!account) {
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
          Please login and connect to MetaMask to create NFTs.
        </p>
      </div>
    );
  }

  const uploadToServer = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        setImage(result.url);
      } catch (error) {
        console.error("File upload error:", error);
      }
    }
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const metadata = JSON.stringify({ image, price, name, description });
      const response = await fetch("http://localhost:5000/upload-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: metadata,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      const metadataUrl = result.url;

      await mintThenList(metadataUrl);
    } catch (error) {
      console.error("NFT creation error:", error);
    }
  };

  const mintThenList = async (uri) => {
    await (await nft.mint(uri)).wait();
    const id = await nft.tokenCount();
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToServer}
                className="input-form"
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
                className="input-form"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
                className="input-form"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
                className="input-form"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
