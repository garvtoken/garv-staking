let provider;
let signer;
let user = null;
let token;
let staking;
let decimals = 18;
let stakeTxHash = "";

/* ===============================
   DOM READY (Mobile Safe)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  if (!connectBtn) return;

  connectBtn.onclick = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please open this DApp in MetaMask / TokenPocket / Trust Wallet browser");
      return;
    }
    await connectWallet();
  };
});

/* ===============================
   CONNECT WALLET
================================ */
async function connectWallet() {
  try {
    let eth = null;

    // Provider detect (mobile + multi-wallet safe)
    if (window.ethereum) {
      eth = window.ethereum;
    } else if (window.ethereum?.providers?.length) {
      eth = window.ethereum.providers[0];
    } else {
      alert("No Web3 wallet detected");
      return;
    }

    // Request account
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      alert("Wallet permission denied");
      return;
    }

    provider = new ethers.providers.Web3Provider(eth);
    signer = provider.getSigner();
    user = await signer.getAddress();

    // Network check
    const net = await provider.getNetwork();
    if (net.chainId !== CHAIN_ID) {
      alert("Please switch to BNB Smart Chain (BSC Mainnet)");
      return;
    }

    // Init contracts
    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);
    decimals = await token.decimals();

    // UI update
    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);

    const btn = document.getElementById("connectBtn");
    btn.innerText = "Wallet Connected";
    btn.className = "gray";
    btn.disabled = true;

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("stakeBtn").disabled = false;

    // ✅ CORRECT FUNCTION
    loadStakeInfo();

  } catch (err) {
    console.error("CONNECT ERROR:", err);
    alert("Wallet connection failed: " + (err?.message || "Unknown error"));
  }
}

/* ===============================
   APPROVE
================================ */
async function approve() {
  if (!user) return alert("Connect wallet first");

  const amt = document.getElementById("amount").value;
  if (!amt || Number(amt) <= 0) return alert("Enter valid amount");

  const value = ethers.utils.parseUnits(amt, decimals);
  const tx = await token.approve(STAKING_CONTRACT, value);
  await tx.wait();

  alert("Approve successful");
}

/* ===============================
   STAKE
================================ */
async function stake() {
  if (!user) return alert("Connect wallet first");

  const amt = document.getElementById("amount").value;
  if (!amt || Number(amt) <= 0) return alert("Enter valid amount");

  const value = ethers.utils.parseUnits(amt, decimals);
  const tx = await staking.stake(value);
  stakeTxHash = tx.hash;

  await tx.wait();

  if (document.getElementById("stakeHash")) {
    document.getElementById("stakeHash").innerText = stakeTxHash;
  }

  alert("Stake successful");
  loadStakeInfo();
}

/* ===============================
   WITHDRAW
================================ */
async function withdraw() {
  if (!user) return;

  const tx = await staking.withdraw();
  await tx.wait();

  alert("Withdraw successful");
  loadStakeInfo();
}

/* ===============================
   LOAD STAKE INFO
================================ */
async function loadStakeInfo() {
  if (!staking || !user) return;

  const info = await staking.getStakeInfo(user);

  const stakedAmount = ethers.utils.formatUnits(info[0], decimals);
  const unlockTime = Number(info[2]) * 1000;

  document.getElementById("staked").innerText = stakedAmount;

  if (Number(info[0]) === 0) {
    document.getElementById("status").innerText = "NOT STAKED";
    document.getElementById("countdown").innerText = "--";

    const w = document.getElementById("withdrawBtn");
    w.disabled = true;
    w.className = "gray";
    return;
  }

  startCountdown(unlockTime);
}

/* ===============================
   COUNTDOWN + WITHDRAW ENABLE
================================ */
function startCountdown(unlockTime) {
  const withdrawBtn = document.getElementById("withdrawBtn");

  const timer = setInterval(() => {
    const diff = unlockTime - Date.now();

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Unlocked";
      document.getElementById("status").innerText = "READY TO WITHDRAW";

      withdrawBtn.disabled = false;
      withdrawBtn.className = "primary";
      clearInterval(timer);
      return;
    }

    withdrawBtn.disabled = true;
    withdrawBtn.className = "gray";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);

    document.getElementById("countdown").innerText =
      d + "d " + h + "h " + m + "m";
  }, 1000);
}
