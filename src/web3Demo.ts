import { connectWallet, getConnectedAddress, modRegistryService } from "./web3";

export async function showWeb3Demo() {
  const walletBtn = document.createElement("button");
  walletBtn.textContent = "Connect Wallet";
  walletBtn.onclick = async () => {
    const address = await connectWallet();
    if (address) {
      walletBtn.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
      // Example: Register a mod (hardcoded demo values)
      try {
        const tx = await modRegistryService.registerMod("DemoMod", "1.0.0", "QmDemoCID");
        alert("Mod registered! TX: " + JSON.stringify(tx));
      } catch (e) {
        alert("Error registering mod: " + e);
      }
    }
  };
  document.body.appendChild(walletBtn);
}
