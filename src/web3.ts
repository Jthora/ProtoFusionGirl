import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Singleton SDK instance for Polygon Mumbai
export const sdk = new ThirdwebSDK("polygon-mumbai");

export async function connectWallet(): Promise<string | null> {
  try {
    await sdk.wallet.connect("injected"); // Use MetaMask or injected wallet
    const address = await sdk.wallet.getAddress();
    console.log("Connected wallet:", address);
    return address;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const address = await sdk.wallet.getAddress();
    return address || null;
  } catch {
    return null;
  }
}
