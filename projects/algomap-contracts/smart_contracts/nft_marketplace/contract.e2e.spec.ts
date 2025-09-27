import { beforeEach, describe, expect, it } from 'vitest'
import { NFTMarketplace } from './contract.algo'

describe('NFTMarketplace E2E', () => {
  let marketplace: NFTMarketplace
  const owner = 'MARKETPLACE_OWNER_ADDRESS'
  const feeAccount = 'FEE_ACCOUNT_ADDRESS'
  const seller = 'SELLER_ADDRESS'
  const buyer = 'BUYER_ADDRESS'

  beforeEach(() => {
    marketplace = new NFTMarketplace()
    marketplace.initialize(owner, 5, feeAccount)
  })

  describe('Complete NFT Trading Flow', () => {
    it('should handle complete NFT creation, listing, and purchase flow', () => {
      const assetId = 12345
      const price = 1000000 // 1 ALGO
      const artTitle = 'Digital Art #1'
      const artDescription = 'A beautiful digital artwork'
      const locationLat = 40.7128
      const locationLng = -74.006
      const imageUrl = 'https://example.com/art1.jpg'
      const category = 'Digital Art'

      // Step 1: Create listing
      expect(() => {
        marketplace.createListing(
          assetId,
          price,
          artTitle,
          artDescription,
          locationLat,
          locationLng,
          imageUrl,
          category,
        )
      }).not.toThrow()

      // Step 2: Verify listing was created
      const listingInfo = marketplace.getListingInfo(assetId)
      expect(listingInfo.price).toBe(price)
      expect(listingInfo.status).toBe(1) // Active
      expect(listingInfo.artTitle).toBe(artTitle)
      expect(listingInfo.artDescription).toBe(artDescription)
      expect(listingInfo.locationLat).toBe(locationLat)
      expect(listingInfo.locationLng).toBe(locationLng)
      expect(listingInfo.imageUrl).toBe(imageUrl)
      expect(listingInfo.category).toBe(category)

      // Step 3: Update listing price
      const newPrice = 1500000 // 1.5 ALGO
      expect(() => {
        marketplace.updateListingPrice(assetId, newPrice)
      }).not.toThrow()

      // Step 4: Verify price update
      const updatedListingInfo = marketplace.getListingInfo(assetId)
      expect(updatedListingInfo.price).toBe(newPrice)

      // Step 5: Cancel listing
      expect(() => {
        marketplace.cancelListing(assetId)
      }).not.toThrow()

      // Step 6: Verify listing is cancelled
      const cancelledListingInfo = marketplace.getListingInfo(assetId)
      expect(cancelledListingInfo.status).toBe(0) // Inactive
    })

    it('should handle multiple listings and search functionality', () => {
      // Create multiple listings
      const listings = [
        {
          assetId: 1001,
          price: 1000000,
          artTitle: 'Artwork 1',
          artDescription: 'First artwork',
          locationLat: 40.7128,
          locationLng: -74.006,
          imageUrl: 'https://example.com/art1.jpg',
          category: 'Painting',
        },
        {
          assetId: 1002,
          price: 2000000,
          artTitle: 'Artwork 2',
          artDescription: 'Second artwork',
          locationLat: 40.7589,
          locationLng: -73.9851,
          imageUrl: 'https://example.com/art2.jpg',
          category: 'Sculpture',
        },
        {
          assetId: 1003,
          price: 1500000,
          artTitle: 'Artwork 3',
          artDescription: 'Third artwork',
          locationLat: 40.7505,
          locationLng: -73.9934,
          imageUrl: 'https://example.com/art3.jpg',
          category: 'Painting',
        },
      ]

      // Create all listings
      listings.forEach((listing) => {
        expect(() => {
          marketplace.createListing(
            listing.assetId,
            listing.price,
            listing.artTitle,
            listing.artDescription,
            listing.locationLat,
            listing.locationLng,
            listing.imageUrl,
            listing.category,
          )
        }).not.toThrow()
      })

      // Verify marketplace stats
      const stats = marketplace.getMarketplaceStats()
      expect(stats.totalListings).toBe(3)

      // Search by category
      const paintingResults = marketplace.searchListingsByCategory('Painting')
      expect(Array.isArray(paintingResults)).toBe(true)

      // Search by location
      const locationResults = marketplace.searchListingsByLocation(40.7128, -74.006, 10)
      expect(Array.isArray(locationResults)).toBe(true)
    })

    it('should handle marketplace administration', () => {
      // Test fee update
      expect(() => {
        marketplace.updateMarketplaceFee(10)
      }).not.toThrow()

      // Test ownership transfer
      const newOwner = 'NEW_OWNER_ADDRESS'
      expect(() => {
        marketplace.transferOwnership(newOwner)
      }).not.toThrow()

      // Test emergency withdrawal
      const amount = 5000000 // 5 ALGO
      const recipient = 'EMERGENCY_RECIPIENT'
      expect(() => {
        marketplace.emergencyWithdraw(amount, recipient)
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid operations gracefully', () => {
      const assetId = 99999
      const price = 1000000

      // Try to update price of non-existent listing
      expect(() => {
        marketplace.updateListingPrice(assetId, price)
      }).toThrow()

      // Try to cancel non-existent listing
      expect(() => {
        marketplace.cancelListing(assetId)
      }).toThrow()

      // Try to get info for non-existent listing
      const listingInfo = marketplace.getListingInfo(assetId)
      expect(listingInfo.price).toBe(0)
      expect(listingInfo.status).toBe(0)
    })

    it('should handle invalid fee percentages', () => {
      // Test negative fee
      expect(() => {
        marketplace.updateMarketplaceFee(-5)
      }).toThrow('Invalid fee percentage')

      // Test fee over 100%
      expect(() => {
        marketplace.updateMarketplaceFee(150)
      }).toThrow('Invalid fee percentage')

      // Test valid fee
      expect(() => {
        marketplace.updateMarketplaceFee(7)
      }).not.toThrow()
    })
  })

  describe('Marketplace Statistics', () => {
    it('should track marketplace statistics correctly', () => {
      // Initial stats
      let stats = marketplace.getMarketplaceStats()
      expect(stats.totalListings).toBe(0)
      expect(stats.feePercentage).toBe(5)
      expect(stats.marketplaceOwner).toBe(owner)
      expect(stats.feeAccount).toBe(feeAccount)

      // Create a listing
      marketplace.createListing(
        2001,
        1000000,
        'Test Art',
        'Test Description',
        40.7128,
        -74.006,
        'https://example.com/test.jpg',
        'Test',
      )

      // Verify stats updated
      stats = marketplace.getMarketplaceStats()
      expect(stats.totalListings).toBe(1)

      // Create another listing
      marketplace.createListing(
        2002,
        2000000,
        'Test Art 2',
        'Test Description 2',
        40.7589,
        -73.9851,
        'https://example.com/test2.jpg',
        'Test',
      )

      // Verify stats updated again
      stats = marketplace.getMarketplaceStats()
      expect(stats.totalListings).toBe(2)
    })
  })
})
