const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FruitMarketplace", function () {
  let fruitMarket, owner, seller, buyer;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();
    const FruitMarketplace = await ethers.getContractFactory("FruitMarketplace");
    fruitMarket = await FruitMarketplace.deploy();
    await fruitMarket.waitForDeployment();
  });

  it("Test 1: Déploiement du contrat", async function () {
    expect(await fruitMarket.getAddress()).to.properAddress;
  });

  it("Test 2: Ajouter une liste de fruits", async function () {
    await fruitMarket.connect(seller).addFruit("Pomme", ethers.parseEther("1"));
    const fruit = await fruitMarket.fruits(0);
    expect(fruit.name).to.equal("Pomme");
    expect(fruit.price).to.equal(ethers.parseEther("1"));
    expect(fruit.available).to.be.true;
  });

  it("Test 3: Acheter un fruit", async function () {
    await fruitMarket.connect(seller).addFruit("Banane", ethers.parseEther("2"));
    await fruitMarket.connect(buyer).buyFruit(0, { value: ethers.parseEther("2") });
    const fruit = await fruitMarket.fruits(0);
    expect(fruit.available).to.be.false;
  });

  it("Test 4: Vérification de la disponibilité des fruits", async function () {
    await fruitMarket.connect(seller).addFruit("Mangue", ethers.parseEther("3"));
    await fruitMarket.connect(buyer).buyFruit(0, { value: ethers.parseEther("3") });
    expect(await fruitMarket.isAvailable(0)).to.be.false;
  });

  it("Test 5: Évaluation du fournisseur", async function () {
    await fruitMarket.connect(buyer).rateSupplier(seller.address, 4);
    const avg = await fruitMarket.getAverageRating(seller.address);
    expect(avg).to.equal(4);
  });

  it("Test 6: Mise à jour de la liste des fruits", async function () {
    await fruitMarket.connect(seller).addFruit("Fraise", ethers.parseEther("1"));
    await fruitMarket.connect(seller).updateFruit(0, "Super Fraise", ethers.parseEther("1.5"));
    const fruit = await fruitMarket.fruits(0);
    expect(fruit.name).to.equal("Super Fraise");
    expect(fruit.price).to.equal(ethers.parseEther("1.5"));
  });

  it("Test 7: Gestion des fonds insuffisants", async function () {
    await fruitMarket.connect(seller).addFruit("Orange", ethers.parseEther("2"));
    await expect(
      fruitMarket.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Insufficient funds");
  });
});
