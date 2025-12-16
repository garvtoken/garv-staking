// ===== CONFIG =====
const GARV_TOKEN = "0x15e4f5092af30ea702dcbac71194ccf08885688d";
const STAKING_CONTRACT = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

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
