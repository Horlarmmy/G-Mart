// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for interacting with ERC20 tokens
interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// Marketplace contract
contract Marketplace {
    // State variables
    uint256 public productsLength; // Number of products in the marketplace
    address public cUsdTokenAddress; // Address of the cUSD token contract

    // Struct to represent a product
    struct Product {
        address payable owner; // Address of the product owner
        string name; // Name of the product
        string image; // Image URL of the product
        string description; // Description of the product
        string location; // Location of the product
        uint256 price; // Price of the product in cUSD
        uint256 sold; // Number of units sold for the product
    }

    // Mapping to store products by index
    mapping(uint256 => Product) public products;

    // Event emitted when a new product is added to the marketplace
    event ProductAdded(address indexed owner, uint256 index, string name, uint256 price);

    // Constructor to initialize the cUSD token address
    constructor(address _cUsdTokenAddress) {
        cUsdTokenAddress = _cUsdTokenAddress;
    }

    // Function to add a new product to the marketplace
    function writeProduct(
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _location,
        uint256 _price
    ) public {
        // Create a new product and store it in the products mapping
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _price,
            0
        );
        // Emit an event to log the addition of the new product
        emit ProductAdded(msg.sender, productsLength, _name, _price);
        // Increment the productsLength counter
        productsLength++;
    }

    // Function to allow a user to purchase a product from the marketplace
    function buyProduct(uint256 _index) public payable {
        // Check if the product exists
        require(_index < productsLength, "Product does not exist");
        // Retrieve the product from the products mapping
        Product storage product = products[_index];
        // Check if the product has not been removed
        require(product.owner != address(0), "Product has been removed");
        // Transfer the product price from the buyer to the product owner
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                product.owner,
                product.price
            ),
            "Transfer failed"
        );
        // Increment the number of units sold for the product
        product.sold++;
    }

    // Function to get the total number of products in the marketplace
    function getProductsLength() public view returns (uint256) {
        return productsLength;
    }
}
