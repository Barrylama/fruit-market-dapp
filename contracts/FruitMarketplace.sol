// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FruitMarketplace {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct Fruit {
        string name;
        uint price;
        address payable seller;
        bool available;
    }

    Fruit[] public fruits;

    mapping(address => uint[]) public purchases;
    mapping(address => uint[]) public listings;
    mapping(address => uint) public ratings;
    mapping(address => uint) public ratingCounts;

    event FruitAdded(uint id, string name, uint price);
    event FruitBought(uint id, address buyer);
    event SupplierRated(address seller, uint rating);
    event FruitUpdated(uint id, string name, uint price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier fruitExists(uint id) {
        require(id < fruits.length, "Fruit does not exist");
        _;
    }

    function addFruit(string memory name, uint price) public onlyOwner {
        require(price > 0, "Price must be greater than 0");
        fruits.push(Fruit(name, price, payable(msg.sender), true));
        listings[msg.sender].push(fruits.length - 1);
        emit FruitAdded(fruits.length - 1, name, price);
    }

    function buyFruit(uint fruitId) public payable fruitExists(fruitId) {
        Fruit storage fruit = fruits[fruitId];
        require(fruit.available, "Fruit not available");
        require(msg.value >= fruit.price, "Insufficient funds");

        fruit.seller.transfer(fruit.price);
        fruit.available = false;
        purchases[msg.sender].push(fruitId);
        emit FruitBought(fruitId, msg.sender);
    }

    function updateFruit(uint fruitId, string memory name, uint price) public onlyOwner fruitExists(fruitId) {
        Fruit storage fruit = fruits[fruitId];
        require(fruit.available, "Cannot update a sold fruit");
        fruit.name = name;
        fruit.price = price;
        emit FruitUpdated(fruitId, name, price);
    }

    function isAvailable(uint fruitId) public view fruitExists(fruitId) returns (bool) {
        return fruits[fruitId].available;
    }

    function getAllFruits() public view returns (Fruit[] memory) {
        return fruits;
    }

    function rateSupplier(address seller, uint rating) public {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        ratings[seller] += rating;
        ratingCounts[seller] += 1;
        emit SupplierRated(seller, rating);
    }

    function getAverageRating(address seller) public view returns (uint) {
        if (ratingCounts[seller] == 0) return 0;
        return ratings[seller] / ratingCounts[seller];
    }
}
