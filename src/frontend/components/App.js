import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import { Spinner } from "react-bootstrap";

// Component Imports
import Navigation from "./Navbar";
import Home from "./Home.js";
import Create from "./Create.js";
import MyListedItems from "./MyListedItems.js";
import MyPurchases from "./MyPurchases.js";
import LandingPage from "./LandingPage.js";

// Contract Data Imports
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setMarketplace] = useState({});

  // Initialization of contracts
  const loadContracts = async (signer) => {
    const marketplaceContract = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    const nftContract = new ethers.Contract(
      NFTAddress.address,
      NFTAbi.abi,
      signer
    );
    setMarketplace(marketplaceContract);
    setNFT(nftContract);
    setLoading(false);
  };

  // Effect hook for loading contracts
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await loadContracts(signer);
      } else {
        console.log("Ethereum wallet (e.g., MetaMask) not detected.");
        setLoading(false);
      }
    };
    init();
  }, []);

  // MetaMask Login/Connect
  const web3Handler = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      await loadContracts(signer);
    } else {
      console.log("Ethereum wallet (e.g., MetaMask) not detected.");
    }
  };

  // Effect hook for account and chain change listeners
  useEffect(() => {
    const handleChainChanged = () => window.location.reload();
    const handleAccountsChanged = (accounts) => setAccount(accounts[0] || null);

    window.ethereum?.on("chainChanged", handleChainChanged);
    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <Spinner animation="border" className="spinner" />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/home"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={
                <Create marketplace={marketplace} nft={nft} account={account} />
              }
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
