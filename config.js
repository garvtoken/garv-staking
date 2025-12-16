// ===== CONFIG =====
const GARV_TOKEN = "0xYOUR_GARV_TOKEN_ADDRESS";
const STAKING_CONTRACT = "0xYOUR_STAKING_CONTRACT_ADDRESS";

// Minimal ERC20 ABI
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Staking ABI
const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw() external",
  "function getStakeInfo(address user) view returns (uint256,uint256,uint256,bool)"
];
