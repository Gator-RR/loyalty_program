# Restaurant Loyatly Program

NFT-based customer loyalty program built for local restaurants to offer new experiences and reduce cost of implimenting digial loyalty.

## Description

A Anchor Project that checks if a customer has an NFT from the Ramen Haus collection. If not, the account is marked with a "Should Receive NFT" (NFT Minting/airdropping functionality to be added). It then increased number of visits by 1 and rewards the customer 10 points. The resaurants can decide how they would redeem rewards 

## Getting Started

### Executing program

* clone the repo
* provide the necessary environment variable in a .env file in root, example
```
ANCHOR_WALLET=/home/<username>/.config/solana/id.json  # Path to your wallet (id.json)
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com    # Devnet RPC URL
```
* Run the program
```
anchor test
```

## Authors

Contributors names and contact info

Sam Tanner
