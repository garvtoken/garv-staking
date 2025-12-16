// ===== NETWORK =====
const CHAIN_ID = 56; // BSC Mainnet

// ===== CONTRACT ADDRESSES =====
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";        // ✔ GARV Token Address
const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";  // ✔ Staking Contract Address

// ===== TOKEN ABI (ERC20) =====
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// ===== STAKING ABI =====
const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw() external",
  "function getStakeInfo(address user) external view returns (uint256,uint256,uint256,bool)"
];
