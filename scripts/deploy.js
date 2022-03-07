
const hre = require("hardhat");

async function main() {

  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  await greeter.deployed();

  const AusschreibungsErstellung = await hre.ethers.getContractFactory("AusschreibungsErstellung");
  const ausschreibungsErstellung = await AusschreibungsErstellung.deploy();
  console.log("Vertrag erstellt: ", ausschreibungsErstellung.address);
  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
