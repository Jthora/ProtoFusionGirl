// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ModRegistry
 * @dev Simple registry for protoFusionGirl mods, storing mod metadata and owner.
 */
contract ModRegistry {
    struct Mod {
        string name;
        string version;
        string ipfsCID;
        address owner;
    }

    Mod[] public mods;
    mapping(string => bool) public registeredCIDs;

    event ModRegistered(uint256 indexed modId, string name, string version, string ipfsCID, address indexed owner);

    function registerMod(string calldata name, string calldata version, string calldata ipfsCID) external {
        require(!registeredCIDs[ipfsCID], "Mod already registered");
        mods.push(Mod({
            name: name,
            version: version,
            ipfsCID: ipfsCID,
            owner: msg.sender
        }));
        registeredCIDs[ipfsCID] = true;
        emit ModRegistered(mods.length - 1, name, version, ipfsCID, msg.sender);
    }

    function getMod(uint256 modId) external view returns (string memory, string memory, string memory, address) {
        require(modId < mods.length, "Invalid modId");
        Mod storage m = mods[modId];
        return (m.name, m.version, m.ipfsCID, m.owner);
    }

    function getModCount() external view returns (uint256) {
        return mods.length;
    }
}
