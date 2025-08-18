const { ethers } = require("hardhat");
require("dotenv").config();

// Replace these with your deployed contract addresses
const RECEIVER_ADDRESS = "0xc5557fA6bAC775Bc2Ea1f3b6Ce0B89919e22fA34";
const OWNER_ADDRESS = "0x7A71A025Df15D764Df5A3445ac387716F6B7ce95";

async function main() {
    // Create a wallet from private key
    const privateKey = process.env.PRIVATE_KEY; // Make sure to set this in your .env file
    if (!privateKey) {
        throw new Error("Please set PRIVATE_KEY in .env file");
    }
    
    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("Using wallet:", wallet.address);
    
    // Connect to existing contracts with the wallet
    const Receiver = await ethers.getContractFactory("Receiver", wallet);
    const receiver = Receiver.attach(RECEIVER_ADDRESS);
    
    const Owner = await ethers.getContractFactory("Owner", wallet);
    const owner = Owner.attach(OWNER_ADDRESS);
    
    console.log("Connected to contracts:");
    console.log("- Receiver:", RECEIVER_ADDRESS);
    console.log("- Owner:", OWNER_ADDRESS);

    // Get initial balances
    const initialReceiverBalance = await provider.getBalance(RECEIVER_ADDRESS);
    const initialOwnerBalance = await provider.getBalance(OWNER_ADDRESS);
    const walletBalance = await provider.getBalance(wallet.address);
    
    console.log("\nInitial balances:");
    console.log("- Wallet:", ethers.formatEther(walletBalance), "ETH");
    console.log("- Receiver:", ethers.formatEther(initialReceiverBalance), "ETH");
    console.log("- Owner contract:", ethers.formatEther(initialOwnerBalance), "ETH");

    // Fund the Owner contract with some ETH first
    const fundAmount = ethers.parseEther("0.02");
    if (walletBalance < fundAmount) {
        throw new Error("Not enough ETH in wallet to fund contract");
    }
    
    console.log("\nFunding Owner contract with", ethers.formatEther(fundAmount), "ETH...");
    const fundTx = await wallet.sendTransaction({
        to: OWNER_ADDRESS,
        value: fundAmount
    });
    await fundTx.wait();
    
    console.log("Funded successfully!");
    console.log("New Owner contract balance:", 
        ethers.formatEther(await provider.getBalance(OWNER_ADDRESS)), "ETH");

    // Test 1: Send ETH using sendToPayable
    try {
        console.log("\nTesting sendToPayable...");
        const amount = ethers.parseEther("0.01");
        const tx = await owner.sendToPayable(amount);
        await tx.wait();
        
        const newBalance = await receiver.getBalance();
        console.log("Success! New receiver balance:", ethers.formatEther(newBalance), "ETH");
    } catch (error) {
        console.log("Error in sendToPayable:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
