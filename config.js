// ================= NETWORK =================
const CHAIN_ID = 56; // BNB Smart Chain Mainnet

// ================= CONTRACT ADDRESSES =================
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0x0c46E12A8dE129f95EFdE408fE8Ee8eAb6B885B6"; 
// ↑ यहाँ अपना FINAL verified staking contract address डालना है

// ================= TOKEN ABI (MINIMAL) =================
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// ================= STAKING ABI =================
const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function withdraw()",
  "function getStakeInfo(address user) view returns (uint256,uint256,uint256,bool)"
];
