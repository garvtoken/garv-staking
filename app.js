let provider;
let signer;
let userAddress;

// ================== NETWORK ==================
const BSC_CHAIN_ID = "0x38"; // 56

// ================== CONTRACTS ==================
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const STAKING_ABI = [
  "function stake(uint256)",
  "function getStakeInfo(address) view returns (uint256,uint256,uint256,bool)"
];

// ================== CONNECT WALLET ==================
async function connectWallet() {

  if (!window.ethereum) {
    alert("Please open this site inside MetaMask / TokenPocket / Trust Wallet browser.");
    return;
  }

  try {
    // 1️⃣ Force BSC Network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_CHAIN_ID }]
    });

  } catch (switchError) {

    // BSC not added
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: BSC_CHAIN_ID,
          chainName: "Binance Smart Chain",
          nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18
          },
          rpcUrls: ["https://bsc-dataseed.binance.org/"],
          blockExplorerUrls: ["https://bscscan.com"]
        }]
      });
    } else {
      alert("Network switch rejected");
      return;
    }
  }

  try {
    // 2️⃣ Connect account
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletStatus").innerText =
      "Wallet: " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

  } catch (err) {
    console.error(err);
    alert("Wallet connection rejected in wallet app");
  }
}

// ================== STAKE ==================
async function stake() {
  if (!signer) {
    alert("Connect wallet first");
    return;
  }

  const amount = document.getElementById("amount").value;
  if (!amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  const token = new ethers.Contract(GARV_TOKEN, ERC20_ABI, signer);
  const staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

  const decimals = await token.decimals();
  const value = ethers.utils.parseUnits(amount, decimals);

  const allowance = await token.allowance(userAddress, STAKING_CONTRACT);

  if (allowance.lt(value)) {
    const tx1 = await token.approve(STAKING_CONTRACT, value);
    await tx1.wait();
  }

  const tx2 = await staking.stake(value);
  await tx2.wait();

  alert("GARV successfully staked");
}

// ================== CHECK STAKE ==================
async function checkStake() {
  if (!signer) {
    alert("Connect wallet first");
    return;
  }

  const staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);
  const info = await staking.getStakeInfo(userAddress);

  alert(
    "Amount: " + ethers.utils.formatUnits(info[0], 18) +
    "\nUnlock: " + new Date(info[2] * 1000).toLocaleString()
  );
                                      }
