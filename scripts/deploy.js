const hre = require("hardhat");

async function main() {
  const FruitMarketplace = await hre.ethers.getContractFactory("FruitMarketplace");
  const fruitMarket = await FruitMarketplace.deploy();

  // Attendre que le contrat soit déployé
  await fruitMarket.waitForDeployment();

  // Récupérer l'adresse
  const address = await fruitMarket.getAddress();

  console.log(`🍉 Contrat FruitMarketplace déployé à : ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
