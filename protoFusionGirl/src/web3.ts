import { ThirdwebSDK } from "@thirdweb-dev/sdk";

export async function connectWallet(): Promise<string | null> {
  try {
    // Prompt user to connect their wallet (MetaMask, WalletConnect, etc.)
    const sdk = new ThirdwebSDK("polygon-mumbai");
    const address = await sdk.wallet.connect();
    console.log("Connected wallet:", address);
    return address;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}
