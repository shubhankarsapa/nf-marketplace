// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount; // Account that receives fees
    uint public immutable feePercent; // Fee percentage on sales 
    uint public itemCount; // Total number of items created

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    mapping(uint => Item) public items; // itemId -> Item

    event Offered(
        uint indexed itemId,
        address indexed nft,
        uint indexed tokenId,
        uint price,
        address seller
    );

    event Bought(
        uint indexed itemId,
        address indexed nft,
        uint indexed tokenId,
        uint price,
        address seller,
        address buyer
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender); // Deployer becomes fee account
        feePercent = _feePercent; // Set marketplace fee percentage
    }

    // List an NFT on the marketplace
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");

        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId); // Transfer NFT to marketplace

        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    // Purchase an NFT listed on the marketplace
    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];

        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");

        item.seller.transfer(item.price); // Pay seller item price
        feeAccount.transfer(_totalPrice - item.price); // Pay marketplace fee

        item.sold = true; // Mark item as sold
        item.nft.transferFrom(address(this), msg.sender, item.tokenId); // Transfer NFT to buyer

        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }

    // Calculate total price of an item including marketplace fee
    function getTotalPrice(uint _itemId) public view returns (uint) {
        return (items[_itemId].price * (100 + feePercent)) / 100;
    }
}
