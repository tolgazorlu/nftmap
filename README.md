# AlgoMap NFT Marketplace

A decentralized NFT marketplace built on Algorand that allows users to buy, sell, and discover NFTs based on geographic location. Local artists can upload images of their physical art and create NFTs for sale.

## Features

- 🎨 **NFT Creation**: Artists can create NFTs from their physical artwork
- 🗺️ **Location-Based Discovery**: Find NFTs near your location using Mapbox integration
- 💰 **Algo Payments**: Buy and sell NFTs using Algorand's native currency
- 🔗 **Wallet Integration**: Connect with popular Algorand wallets (Pera, Defly, Exodus)
- 📱 **Responsive Design**: Modern UI built with React and Tailwind CSS
- 🔒 **Secure Transactions**: Smart contract-based marketplace with escrow functionality

## Project Structure

```
algomap/
├── projects/
│   ├── algomap-contracts/          # Smart contracts
│   │   └── smart_contracts/
│   │       ├── algomap/            # Original contract
│   │       └── nft_marketplace/    # NFT marketplace contract
│   └── algomap-frontend/          # React frontend
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── contracts/         # Contract integration
│       │   └── utils/             # Utility functions
│       └── public/                # Static assets
```

## Smart Contract

The NFT marketplace contract (`NFTMarketplace`) provides the following functionality:

### Core Methods

- `initialize(marketplaceOwner, feePercentage, feeAccount)` - Initialize the marketplace
- `createListing(assetId, price, artTitle, artDescription, locationLat, locationLng, imageUrl, category)` - Create a new NFT listing
- `buyNFT(assetId, seller)` - Purchase an NFT
- `cancelListing(assetId)` - Cancel a listing
- `updateListingPrice(assetId, newPrice)` - Update listing price
- `getListingInfo(assetId)` - Get listing details
- `getMarketplaceStats()` - Get marketplace statistics

### State Management

- **Global State**: Marketplace configuration, total listings, fee settings
- **Local State**: Individual listing details (price, status, metadata, location)
