let provider;
let signer;
let stakingContract;
let tokenContract;

/* ================= ADDRESSES ================= */

const GARV_TOKEN_ADDRESS =
  "0x15e4f5092af30ea702dcbac71194ccf08885688d";

const STAKING_ADDRESS =
  "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

/* ================= TOKEN ABI (ERC20) ================= */

const TOKEN_ABI = [
  "function approve(address spender,uint256 amount) external returns(bool)",
  "function balanceOf(address owner) view returns(uint256)",
  "function decimals() view returns(uint8)"
];

/* ================= STAKING ABI ================= */

const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function getStakeInfo(address user) view returns(uint256,uint256,uint256,bool)"
];

/* ================= CONNECT WALLET ================= */

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please open this site inside MetaMask / Trust / TokenPocket");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    if (network.chainId !== 56) {
      alert("Please switch to BSC Mainnet");
      return;
    }

    const address = await signer.getAddress();

    stakingContract = new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      signer
    );

    tokenContract = new ethers.Contract(
      GARV_TOKEN_ADDRESS,
      TOKEN_ABI,
      signer
    );

    document.getElementById("walletStatus").innerText =
      "Wallet Connected: " +
      address.substring(0, 6) +
      "..." +
      address.slice(-4);

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed or rejected");
  }
}

/* ================= STAKE ================= */

async function stake() {
  try {
    const amount = document.getElementById("amount").value;
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const decimals = await tokenContract.decimals();
    const value = ethers.utils.parseUnits(amount, decimals);

    const approveTx = await tokenContract.approve(
      STAKING_ADDRESS,
      value
    );
    await approveTx.wait();

    const stakeTx = await stakingContract.stake(value);
    await stakeTx.wait();

    alert("Stake successful");

  } catch (err) {
    console.error(err);
    alert("Stake failed");
  }
}

/* ================= CHECK STAKE ================= */

async function checkStake() {
  try {
    const user = await signer.getAddress();
    const info = await stakingContract.getStakeInfo(user);

    alert(
      "Staked Amount: " +
        ethers.utils.formatUnits(info[0], 18) +
        "\nUnlock Time: " +
        new Date(info[2] * 1000).toLocaleString()
    );

  } catch (err) {
    console.error(err);
    alert("Unable to fetch stake info");
  }
}
