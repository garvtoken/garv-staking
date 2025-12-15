let provider;
let signer;
let stakingContract;
let tokenContract;

// ================= ADDRESSES =================
const GARV_TOKEN_ADDRESS = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_ADDRESS   = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

// ================= TOKEN ABI (ERC20) =================
const TOKEN_ABI = [
  "function approve(address spender,uint256 amount) external returns(bool)",
  "function balanceOf(address owner) view returns(uint256)",
  "function decimals() view returns(uint8)"
];

// ================= STAKING ABI =================
const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function getStakeInfo(address user) view returns(uint256,uint256,uint256,bool)"
];

// ================= CONNECT WALLET =================
async function connectWallet(){
  if(!window.ethereum){
    alert("Open this site inside MetaMask / Trust Wallet / TokenPocket");
    return;
  }

  try{
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    if(network.chainId !== 56){
      alert("Please switch to BSC Mainnet");
      return;
    }

    const address = await signer.getAddress();
    document.getElementById("walletStatus").innerText =
      "Wallet Connected: " + address.slice(0,6) + "..." + address.slice(-4);

    tokenContract   = new ethers.Contract(GARV_TOKEN_ADDRESS, TOKEN_ABI, signer);
    stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);

  }catch(e){
    alert("Wallet connection rejected");
  }
}

// ================= STAKE =================
async function stakeTokens(){
  if(!stakingContract){
    alert("Connect wallet first");
    return;
  }

  const amount = document.getElementById("stakeAmount").value;
  if(!amount || amount <= 0){
    alert("Enter valid amount");
    return;
  }

  try{
    const decimals = await tokenContract.decimals();
    const parsed = ethers.utils.parseUnits(amount, decimals);

    const approveTx = await tokenContract.approve(STAKING_ADDRESS, parsed);
    await approveTx.wait();

    const stakeTx = await stakingContract.stake(parsed);
    await stakeTx.wait();

    alert("Stake successful");

  }catch(e){
    alert("Transaction failed");
  }
}

// ================= CHECK STAKE =================
async function checkMyStake(){
  if(!stakingContract){
    alert("Connect wallet first");
    return;
  }

  try{
    const addr = await signer.getAddress();
    const info = await stakingContract.getStakeInfo(addr);

    document.getElementById("stakeInfo").innerText =
      "Amount: " + ethers.utils.formatEther(info[0]) +
      "\nUnlock Time: " + new Date(info[2]*1000).toLocaleString() +
      "\nWithdrawn: " + info[3];

  }catch(e){
    alert("No active stake");
  }
}

// ================= PRICE (STATIC SAFE) =================
document.getElementById("priceBox").innerText =
  "Price via PancakeSwap (on-chain)";
