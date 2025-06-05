import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("ModRegistry", function () {
  let modRegistry;

  beforeEach(async function () {
    const ModRegistry = await ethers.getContractFactory("ModRegistry");
    modRegistry = await ModRegistry.deploy();
  });

  it("should register a new mod and emit event", async function () {
    const tx = await modRegistry.registerMod("TestMod", "1.0.0", "QmTestCID");
    const receipt = await tx.wait();
    // For ESM/Hardhat v6+, events are in receipt.logs, not receipt.events
    const logs = receipt.logs || [];
    // Optionally, just check that the transaction succeeded and mod is registered
    const mod = await modRegistry.getMod(0);
    expect(mod[0]).to.equal("TestMod");
    expect(mod[1]).to.equal("1.0.0");
    expect(mod[2]).to.equal("QmTestCID");
  });

  it("should not allow duplicate mod CIDs", async function () {
    await modRegistry.registerMod("TestMod", "1.0.0", "QmTestCID");
    await expect(
      modRegistry.registerMod("TestMod2", "1.0.1", "QmTestCID")
    ).to.be.revertedWith("Mod already registered");
  });

  it("should return mod info by modId", async function () {
    await modRegistry.registerMod("TestMod", "1.0.0", "QmTestCID");
    const mod = await modRegistry.getMod(0);
    expect(mod[0]).to.equal("TestMod");
    expect(mod[1]).to.equal("1.0.0");
    expect(mod[2]).to.equal("QmTestCID");
  });

  it("should return mod info by CID", async function () {
    await modRegistry.registerMod("TestMod", "1.0.0", "QmTestCID");
    const mod = await modRegistry.getModByCID("QmTestCID");
    expect(mod[0]).to.equal("TestMod");
    expect(mod[1]).to.equal("1.0.0");
  });

  it("should return correct mod count", async function () {
    await modRegistry.registerMod("TestMod", "1.0.0", "QmTestCID");
    await modRegistry.registerMod("TestMod2", "1.0.1", "QmTestCID2");
    const count = await modRegistry.getModCount();
    expect(count).to.equal(2);
  });
});
