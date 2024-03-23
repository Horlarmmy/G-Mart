# G'Mart

## Description
This is a gadgets marketplace dapp where users can:
* View gadgets on the store
* Add gadgets to the store
* Buy gadgets
* Drop a review on gadgets bought
* See what others think about the gadgets

## Live Demo
[G'Mart](https://horlarmmy.github.io/G-Mart/)
## Usage

### Requirements
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the Google Chrome Store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.

### Test
1. Create a product.
2. Create a second account in your extension wallet and send them cUSD tokens.
3. Buy product with secondary account.
4. Check if balance of first account increased.
5. Drop review on the product bought.
6. Upvote a Product you liked.
7. Check others reviews on the product you are purchasing

# Contract Overview

The Marketplace contract facilitates a decentralized marketplace where users can list products for sale, purchase products using cUSD (a stablecoin), review purchased products, and upvote products they like. It leverages an ERC20 token interface (IERC20Token) for transactions.

## Structs

### Product

- `owner`: The address of the product owner, capable of receiving payments.
- `name`: The name of the product.  
- `image`: A link or hash to the product's image.
- `description`: A detailed description of the product.
- `location`: The location associated with the product, possibly where it's sold or manufactured.
- `price`: The price of the product in cUSD tokens.
- `sold`: A counter tracking the number of times the product has been sold.
- `reviewCount`: Tracks the number of reviews a product has received.
- `upvotes`: Counts how many upvotes a product has received.

### Review

- `reviewer`: The address of the user who submitted the review.
- `comment`: The content of the review, providing feedback or opinions on the product.
- `rating`: A numerical rating associated with the review, on a scale of 1 to 5.

## Mappings

- `products`: Maps a product ID (uint) to a Product struct, storing details about each product listed on the marketplace.
- `reviews`: Maps a product ID to an array of Review structs, holding all reviews associated with a specific product.  
- `hasBought`: A double mapping that tracks whether a specific address (user) has purchased a particular product. This is used to enforce rules around who can leave a review.
- `hasUpvoted`: Similar to hasBought, this double mapping tracks whether an address (user) has upvoted a specific product, preventing multiple upvotes from the same user.

## Events

- `ProductPurchased`: Emitted when a product is purchased, including the product ID and buyer's address.
- `ReviewAdded`: Emitted upon the addition of a review, indicating the product ID and the reviewer's address.  
- `ProductUpvoted`: Signifies that a product has been upvoted, detailing the product ID and the voter's address.

## Functions

- `writeProduct` - Allows users to list a new product on the marketplace by providing details such as name, image, description, location, and price.

- `readProduct` - Returns the details of a product by its ID, including owner address, name, image, description, location, price, the number of times sold, and upvotes.

- `buyProduct` - Enables the purchase of a product using cUSD tokens. It checks for successful transfer of funds from the buyer to the product owner, increments the sold counter, and marks the buyer as having purchased the product.

- `addReview` - Allows users who have purchased a product to add a review. It requires the user to have bought the product and restricts the rating to a scale of 1 to 5. 

- `upvoteProduct` - Users can upvote a product, given they haven't already done so. It increments the product's upvote count and marks the user as having upvoted.

- `getReviewsForProduct` - Returns all reviews for a given product, facilitating transparency and informed purchasing decisions.  

- `getProductsLength` - Provides the total number of products listed on the marketplace, useful for iterating over all products.



## Project Setup

### Install
```
npm install
```

### Start
```
npm run dev
```

### Build
```
npm run build
