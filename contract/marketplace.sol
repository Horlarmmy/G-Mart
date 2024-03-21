// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Marketplace {
    uint internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint price;
        uint sold;
        uint reviewCount; // Track the number of reviews per product
        uint upvotes; // Track the number of upvotes per product
    }

    struct Review {
        address reviewer;
        string comment;
        uint rating; // Example rating system: 1 to 5
    }

    mapping (uint => Product) internal products;
    mapping (uint => Review[]) public reviews; // Maps product index to its reviews
    mapping (uint => mapping(address => bool)) public hasBought; // Tracks if a user has bought an item
    mapping (uint => mapping(address => bool)) public hasUpvoted; // Tracks if a user has upvoted an item

    // Events
    event ProductPurchased(uint indexed productId, address buyer);
    event ReviewAdded(uint indexed productId, address reviewer);
    event ProductUpvoted(uint indexed productId, address voter);

    function writeProduct(string memory _name, string memory _image, string memory _description, string memory _location, uint _price) public {
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _price,
            0, // Initially sold 0
            0,  // Initially 0 reviews
            0   // Initially 0 upvotes
        );
        productsLength++;
    }

    function readProduct(uint _index) public view returns (address payable, string memory, string memory, string memory, string memory, uint, uint, uint) {
        Product memory product = products[_index];
        return (product.owner, product.name, product.image, product.description, product.location, product.price, product.sold, product.upvotes);
    }

    function buyProduct(uint _index) public payable {
        require(IERC20Token(cUsdTokenAddress).transferFrom(msg.sender, products[_index].owner, products[_index].price), "Transfer failed.");
        products[_index].sold++;
        hasBought[_index][msg.sender] = true; // Mark the buyer as having bought the product
        emit ProductPurchased(_index, msg.sender);
    }

    function addReview(uint _productId, string memory _comment, uint _rating) public {
        require(hasBought[_productId][msg.sender], "You must purchase the product before reviewing.");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5.");
        reviews[_productId].push(Review(msg.sender, _comment, _rating));
        products[_productId].reviewCount++;
        emit ReviewAdded(_productId, msg.sender);
    }

    function upvoteProduct(uint _productId) public {
        require(!hasUpvoted[_productId][msg.sender], "You have already upvoted this product.");
        products[_productId].upvotes++;
        hasUpvoted[_productId][msg.sender] = true; // Mark the user as having upvoted the product
        emit ProductUpvoted(_productId, msg.sender);
    }

    function getReviewsForProduct(uint _productId) public view returns (Review[] memory) {
        return reviews[_productId];
    }

    function getProductsLength() public view returns (uint) {
        return productsLength;
    }
}
