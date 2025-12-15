const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";

const ABI = [
  "function autoStake(uint256 amount)",
  "function getStakeInfo(address user) view returns(uint256,uint256,uint256,bool)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

let provider, signer, staking;

async function connectWallet() {
  if (!window.ethereum) {
    alert("Wallet not found");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("wallet").innerText = "Connected: " + address;

  staking = new ethers.Contract(STAKING_CONTRACT, ABI, signer);
}

async function stake() {
  const amount = document.getElementById("amount").value;
  if (!amount || amount <= 0) {
    alert("Enter amount");
    return;
  }

  const token = new ethers.Contract(GARV_TOKEN, ABI, signer);
  const decimals = 18;
  const value = ethers.utils.parseUnits(amount, decimals);

  await token.approve(STAKING_CONTRACT, value);
  await staking.autoStake(value);

  alert("Stake successful");
}

async function getStake() {
  const address = await signer.getAddress();
  const info = await staking.getStakeInfo(address);

  document.getElementById("info").innerText = `
Amount: ${ethers.utils.formatUnits(info[0], 18)} GARV
Start: ${new Date(info[1] * 1000)}
Unlock: ${new Date(info[2] * 1000)}
Active: ${info[3]}
  `;
}
