let provider;
let signer;
let user = null;
let token;
let staking;
let decimals = 18;
let stakeTxHash = "";

/* ===============================
   SAFE WALLET INIT (Mobile Ready)
================================ */
window.addEventListener("load", () => {
  const connectBtn = document.getElementById("connectBtn");
  if (!connectBtn) return;

  connectBtn.addEventListener("click", async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please open this DApp in MetaMask / TokenPocket browser");
      return;
    }
    await connectWallet();
  });
});

/* ===============================
   CONNECT WALLET
================================ */
async function connectWallet() {
  try {
    let eth = null;

    // 1️⃣ Detect provider (modern + legacy)
    if (window.ethereum) {
      eth = window.ethereum;
    } else if (window.ethereum?.providers?.length) {
      eth = window.ethereum.providers[0];
    } else {
      alert("Please open this page inside MetaMask / TokenPocket / Trust Wallet DApp browser");
      return;
    }

    // 2️⃣ Request account
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts || !accounts.length) {
      alert("Wallet permission denied");
      return;
    }

    // 3️⃣ Provider
    provider = new ethers.providers.Web3Provider(eth);
    signer = provider.getSigner();
    user = await signer.getAddress();

    // 4️⃣ Network check (BSC Mainnet only)
    const net = await provider.getNetwork();
    if (net.chainId !== 56) {
      alert("Please switch wallet network to BNB Smart Chain (BSC)");
      return;
    }

    // 5️⃣ Contracts
    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);
    decimals = await token.decimals();

    // 6️⃣ UI SUCCESS
    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);

    const btn = document.getElementById("connectBtn");
    btn.innerText = "Wallet Connected";
    btn.className = "gray";
    btn.disabled = true;

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("stakeBtn").disabled = false;

    loadStake();

  } catch (err) {
    console.error("CONNECT ERROR:", err);
    alert("Wallet connection failed. Please reopen in DApp browser.");
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
  alert("Stake successful");

  document.getElementById("stakeHash").innerText = stakeTxHash;
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
    document.getElementById("withdrawBtn").disabled = true;
    document.getElementById("withdrawBtn").className = "gray";
    document.getElementById("countdown").innerText = "--";
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
    const now = Date.now();
    const diff = unlockTime - now;

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
