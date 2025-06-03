// ModRegistryService.ts - abstraction for ModRegistry smart contract interaction
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import type { ContractInterface } from "ethers";

// TODO: Replace with actual deployed contract address and ABI
// Use Vite's import.meta.env for frontend env variables
const MOD_REGISTRY_ADDRESS = import.meta.env.VITE_MOD_REGISTRY_ADDRESS || "0xYourDeployedAddress";
// Use ContractInterface and allow empty array only for dev, but cast as ContractInterface for type safety
const MOD_REGISTRY_ABI = [
  // TODO: Replace with actual ABI array
] as unknown as import("ethers").ContractInterface;

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

  async fetchAllMods(): Promise<any[]> {
    const count = await this.getModCount();
    const mods = [];
    for (let i = 0; i < count; i++) {
      mods.push(await this.getMod(i));
    }
    return mods;
  }
}
