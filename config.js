// ===== NETWORK =====
const CHAIN_ID = 56; // BSC Mainnet

// ===== CONTRACT ADDRESSES =====
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0xf5be3b4a8fb7cd68588b902e4976ff4ac8387f";

// ===== ERC20 ABI =====
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
