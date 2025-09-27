# Frontend Implementation Guide

## Prerequisites

- Node.js 20+
- npm 9+
- Algorand wallet (Pera, Defly, or Exodus)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd algomap
   ```

2. **Install dependencies**

   ```bash
   # Install contract dependencies
   cd projects/algomap-contracts
   npm install

   # Install frontend dependencies
   cd ../algomap-frontend
   npm install
   ```

3. **Environment Setup**
   Create `.env` files in both projects:

   **algomap-contracts/.env**

   ```env
   MARKETPLACE_OWNER=YOUR_ALGORAND_ADDRESS
   FEE_ACCOUNT=YOUR_FEE_ACCOUNT_ADDRESS
   FEE_PERCENTAGE=5
   ```

   **algomap-frontend/.env**

   ```env
   VITE_ALGOD_NETWORK=testnet
   VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
   VITE_ALGOD_PORT=443
   VITE_ALGOD_TOKEN=
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

## Mapbox Integration

### 1. Get Mapbox Access Token

1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to your account page and create an access token
3. Add the token to your `.env` file

### 2. Install Mapbox Dependencies

```bash
cd projects/algomap-frontend
npm install mapbox-gl @types/mapbox-gl
```

### 3. Create Map Component

Create `src/components/Map.tsx`:

```tsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: Array<{
    id: number;
    lat: number;
    lng: number;
    title: string;
    imageUrl: string;
    price: number;
  }>;
}

const Map: React.FC<MapProps> = ({ onLocationSelect, markers = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 2,
    });

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect(lat, lng);
      });
    }

    // Add markers for NFT listings
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "nft-marker";
      el.style.backgroundImage = `url(${marker.imageUrl})`;
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #fff";
      el.style.cursor = "pointer";

      new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <h3>${marker.title}</h3>
              <p>Price: ${marker.price / 1000000} ALGO</p>
            </div>
          `)
        )
        .addTo(map.current);
    });

    return () => {
      map.current?.remove();
    };
  }, [markers, onLocationSelect]);

  return <div ref={mapContainer} className="w-full h-96 rounded-lg" />;
};

export default Map;
```

### 4. Create NFT Upload Component

Create `src/components/NFTUpload.tsx`:

```tsx
import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

interface NFTUploadProps {
  onUpload: (data: {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    locationLat: number;
    locationLng: number;
    price: number;
  }) => void;
}

const NFTUpload: React.FC<NFTUploadProps> = ({ onUpload }) => {
  const { activeAddress } = useWallet();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    locationLat: 0,
    locationLng: 0,
    price: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(formData);
  };

  if (!activeAddress) {
    return <div className="alert alert-warning">Please connect your wallet to upload NFTs</div>;
  }

  return (
    <div className="card w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title">Create NFT Listing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Art Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="Painting">Painting</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Photography">Photography</option>
              <option value="Mixed Media">Mixed Media</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Image URL</span>
            </label>
            <input
              type="url"
              className="input input-bordered"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Price (ALGO)</span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input input-bordered"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.000001"
                placeholder="Latitude"
                className="input input-bordered"
                value={formData.locationLat}
                onChange={(e) => setFormData({ ...formData, locationLat: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.000001"
                placeholder="Longitude"
                className="input input-bordered"
                value={formData.locationLng}
                onChange={(e) => setFormData({ ...formData, locationLng: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Create NFT Listing
          </button>
        </form>
      </div>
    </div>
  );
};

export default NFTUpload;
```

## Wallet Integration

The project already includes wallet integration using `@txnlab/use-wallet-react`. The supported wallets are:

- **Pera Wallet** (Mobile)
- **Defly Wallet** (Mobile)
- **Exodus Wallet** (Desktop)
- **LocalNet Wallet** (Development)

## Contract Integration

To integrate with the smart contract:

1. **Deploy the contract**:

   ```bash
   cd projects/algomap-contracts
   npm run deploy
   ```

2. **Generate client**:

   ```bash
   npm run build
   ```

3. **Use in frontend**:

   ```tsx
   import { NFTMarketplaceClient } from "../contracts/NFTMarketplaceClient";

   const client = new NFTMarketplaceClient({
     algod: algodClient,
     indexer: indexerClient,
   });

   // Call contract methods
   await client.createListing({
     assetId: 12345,
     price: 1000000,
     artTitle: "My Art",
     // ... other parameters
   });
   ```

## Development

### Running the Development Server

1. **Start the frontend**:

   ```bash
   cd projects/algomap-frontend
   npm run dev
   ```

2. **Run contract tests**:
   ```bash
   cd projects/algomap-contracts
   npm test
   ```

### Building for Production

```bash
cd projects/algomap-frontend
npm run build
```

## Deployment

### Smart Contract Deployment

1. **Testnet Deployment**:

   ```bash
   cd projects/algomap-contracts
   npm run deploy
   ```

2. **Mainnet Deployment**:
   Update environment variables and run:
   ```bash
   npm run deploy
   ```

### Frontend Deployment

The frontend can be deployed to any static hosting service:

- **Vercel**: `npm run ci:vercel:deploy`
- **Netlify**: Connect your GitHub repository
- **GitHub Pages**: Use the build output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Join our Discord community
- Check the Algorand Developer Portal

## Roadmap

- [ ] Implement advanced search filters
- [ ] Add auction functionality
- [ ] Integrate with IPFS for decentralized storage
- [ ] Add social features (likes, comments)
- [ ] Mobile app development
- [ ] Multi-language support
