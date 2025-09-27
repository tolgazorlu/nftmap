import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NFTMarketplaceFactory } from '../artifacts/nft_marketplace/NFTMarketplaceClient'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying NFT Marketplace ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(NFTMarketplaceFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

  // If app was just created fund the app account
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  const method = 'initialize'
  const response = await appClient.send.initialize({
    args: {
      marketplaceOwner: deployer.addr,
      feePercentage: 5,
      feeAccount: deployer.addr,
    },
  })
  console.log(
    `Called ${method} on ${appClient.appClient.appName} (${appClient.appClient.appId}), received: ${response.return}`,
  )
}
