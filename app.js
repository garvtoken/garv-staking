let provider;
let signer;
let userAddress;

// ===== CONFIG =====
const BSC_CHAIN_ID = 56;

const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";
const PANCAKE_PAIR = "0x00bb266615faeaae9d9d5b17668829580a038b9b";

// ===== ABI =====
const tokenABI = [
  "function balanceOf(address) view returns(uint)",
  "function approve(address,uint) returns(bool)",
  "function decimals() view returns(uint8)"
];

const stakingABI = [
  "function stake(uint256)",
  "function getStakeInfo(address) view returns(uint256,uint256,uint256,bool)"
];

// ===== WALLET CONNECT =====
async function connectWallet(){
  try{
    if(window.ethereum){
      provider = new ethers.providers.Web3Provider(window.ethereum,"any");
      await provider.send("eth_requestAccounts",[]);
    }else{
      const wc = new WalletConnectProvider.default({
        rpc:{56:"https://bsc-dataseed.binance.org/"},
        chainId:56
      });
      await wc.enable();
      provider = new ethers.providers.Web3Provider(wc);
    }

    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    await ensureBSC();

    document.getElementById("walletStatus").innerText =
      "Wallet Connected: "+userAddress.slice(0,6)+"..."+userAddress.slice(-4);

    loadPrice();

  }catch(e){
    alert("Wallet connection failed");
    console.error(e);
  }
}

// ===== ENSURE BSC =====
async function ensureBSC(){
  const net = await provider.getNetwork();
  if(net.chainId !== BSC_CHAIN_ID){
    await window.ethereum.request({
      method:"wallet_switchEthereumChain",
      params:[{chainId:"0x38"}]
    });
  }
}

// ===== STAKE =====
async function stakeTokens(){
  try{
    const amt = document.getElementById("stakeAmount").value;
    if(!amt) return alert("Enter amount");

    const token = new ethers.Contract(GARV_TOKEN,tokenABI,signer);
    const staking = new ethers.Contract(STAKING_CONTRACT,stakingABI,signer);

    const decimals = await token.decimals();
    const value = ethers.utils.parseUnits(amt,decimals);

    await token.approve(STAKING_CONTRACT,value);
    await staking.stake(value);

    alert("Staked Successfully");

  }catch(e){
    console.error(e);
    alert("Stake failed");
  }
}

// ===== CHECK STAKE =====
async function checkStake(){
  try{
    const staking = new ethers.Contract(STAKING_CONTRACT,stakingABI,provider);
    const info = await staking.getStakeInfo(userAddress);

    document.getElementById("stakeInfo").innerText =
      "Amount: "+ethers.utils.formatUnits(info[0],18)+
      "\nUnlock: "+new Date(info[2]*1000).toLocaleDateString();

  }catch(e){
    console.error(e);
  }
}

// ===== LIVE PRICE (PLACEHOLDER) =====
function loadPrice(){
  document.getElementById("price").innerText =
    "Live via PancakeSwap Pair";
      }
