const { ethers } = require("hardhat");

async function main() {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy receiver
    const Receiver = await ethers.getContractFactory("Receiver");
    const receiver = await Receiver.deploy();
    await receiver.waitForDeployment();
    console.log("Receiver deployed to:", await receiver.getAddress());

    // Deploy owner
    const Owner = await ethers.getContractFactory("Owner");
    const owner = await Owner.deploy(
        await receiver.getAddress(),  // _receiverAddr
        await receiver.getAddress()   // _receiverPayableAddr (using same address for demo)
    );
    await owner.waitForDeployment();
    console.log("Owner deployed to:", await owner.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});