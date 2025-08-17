const { ethers } = require("ethers");
require("dotenv").config();

const CONTRACT_ADDRESS = "0x9c49C16A41E4685ac5099521C930255297133C45"; // contract đã deploy
const ABI = [
  "function getMessage() view returns (string)",
  "function setMessage(string newMessage)"
];

async function main() {
  // create provider
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  );

  // connect wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // connect contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  // read message
  let message = await contract.getMessage();
  console.log("Current message:", message);

  // send tx update message
  let tx = await contract.setMessage("Hello từ Ethers v6!");
  await tx.wait();

  // read message after update
  message = await contract.getMessage();
  console.log("Updated message:", message);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
