let provider;
let signer;
let userAddress;

// ===== CONTRACT DETAILS =====
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

const ERC20_ABI = [
  "function approve(address spender,uint256 amount) public returns(bool)",
  "function allowance(address owner,address spender) view returns(uint256)",
  "function balanceOf(address) view returns(uint256)",
  "function decimals() view returns(uint8)"
];

const STAKING_ABI = [
  "function stake(uint256 amount) public",
  "function getStakeInfo(address user) view returns(uint256,uint256,uint256,bool)"
];

// ===== WALLET CONNECT (MOBILE ONLY) =====
async function connectWallet() {
  if (!window.ethereum) {
    alert("Please open this site inside MetaMask / TokenPocket / Trust Wallet browser.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletStatus").innerText =
      "Wallet: " + userAddress.slice(0,6) + "..." + userAddress.slice(-4);

  } catch (err) {
    alert("Wallet connection failed");
  }
}

// ===== STAKE FUNCTION =====
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

  alert("GARV Staked Successfully");
}

// ===== CHECK STAKE =====
async function checkStake() {
  if (!signer) {
    alert("Connect wallet first");
    return;
  }

  const staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);
  const info = await staking.getStakeInfo(userAddress);

  alert(
    "Amount: " + ethers.utils.formatUnits(info[0], 18) +
    "\nUnlock Time: " + new Date(info[2] * 1000).toLocaleString()
  );
}
