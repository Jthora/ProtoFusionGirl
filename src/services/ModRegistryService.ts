// ModRegistryService.ts - abstraction for ModRegistry smart contract interaction
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// TODO: Replace with actual deployed contract address and ABI
// Use Vite's import.meta.env for frontend env variables
const MOD_REGISTRY_ADDRESS = import.meta.env.VITE_MOD_REGISTRY_ADDRESS || "0xYourDeployedAddress";
const MOD_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "version", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" }
    ],
    "name": "registerMod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "modId", "type": "uint256" } ],
    "name": "getMod",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getModCount",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "string", "name": "ipfsCID", "type": "string" } ],
    "name": "getModByCID",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "version", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "modId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "modId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "version", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "ModRegistered",
    "type": "event"
  }
] as const;

export class ModRegistryService {
  private contract: any;

  constructor(sdk: ThirdwebSDK) {
    if (!MOD_REGISTRY_ADDRESS || MOD_REGISTRY_ADDRESS === "0xYourDeployedAddress") {
      throw new Error("MOD_REGISTRY_ADDRESS is not set. Please provide a valid contract address.");
    }
    if (!MOD_REGISTRY_ABI || (Array.isArray(MOD_REGISTRY_ABI) && MOD_REGISTRY_ABI.length === 0)) {
      throw new Error("MOD_REGISTRY_ABI is not set. Please provide the contract ABI.");
    }
    this.contract = sdk.getContract(MOD_REGISTRY_ADDRESS, MOD_REGISTRY_ABI);
  }

  async registerMod(name: string, version: string, ipfsCID: string): Promise<any> {
    return await this.contract.call("registerMod", [name, version, ipfsCID]);
  }

  async getModCount(): Promise<number> {
    return await this.contract.call("getModCount");
  }

  async getMod(modId: number): Promise<any> {
    return await this.contract.call("getMod", [modId]);
  }

  async getModByCID(ipfsCID: string): Promise<any> {
    return await this.contract.call("getModByCID", [ipfsCID]);
  }

  async fetchAllMods(): Promise<any[]> {
    const count = await this.getModCount();
    const mods = [];
    for (let i = 0; i < count; i++) {
      mods.push(await this.getMod(i));
    }
    return mods;
  }
}
