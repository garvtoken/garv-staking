let provider, signer, user;
let token, staking;
let decimals = 18;
let stakeTxHash = "";

/* ================= CONNECT BUTTON ================= */
window.addEventListener("load", () => {
  document.getElementById("connectBtn").onclick = connectWallet;
  document.getElementById("approveBtn").onclick = approve;
  document.getElementById("stakeBtn").onclick = stake;
  document.getElementById("withdrawBtn").onclick = withdraw;
});

/* ================= CONNECT WALLET ================= */
async function connectWallet() {
  try {
    // 1️⃣ Check provider
    if (typeof window.ethereum === "undefined") {
      alert(
        "Please open this website inside a decentralized wallet DApp Browser.\n\n" +
        "Supported wallets:\n" +
        "• TokenPocket\n" +
        "• Trust Wallet\n" +
        "• MetaMask\n" +
        "• OKX Wallet\n" +
        "• Binance Web3 Wallet"
      );
      return;
    }

    const eth = window.ethereum;

    // 2️⃣ Request account access
    const accounts = await eth.request({
      method: "eth_requestAccounts"
    });

    if (!accounts || accounts.length === 0) {
      alert("Wallet permission rejected");
      return;
    }

    // 3️⃣ Create provider & signer
    provider = new ethers.providers.Web3Provider(eth, "any");
    signer = provider.getSigner();
    user = await signer.getAddress();

    // 4️⃣ Network check (BSC only)
    const net = await provider.getNetwork();
    if (net.chainId !== 56) {
      alert("Please switch network to BNB Smart Chain (BSC)");
      return;
    }

    // 5️⃣ Init contracts
    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);
    decimals = await token.decimals();

    // 6️⃣ UI update
    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);

    const btn = document.getElementById("connectBtn");
    btn.innerText = "Wallet Connected";
    btn.className = "gray";
    btn.disabled = true;

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("stakeBtn").disabled = false;

    loadStakeInfo();

  } catch (error) {
    console.error("Wallet connect error:", error);
    alert("Wallet connection failed or cancelled by user.");
  }
}

/* ================= APPROVE ================= */
async function approve() {
  const amt = document.getElementById("amount").value;
  if (!amt) return alert("Enter amount");

  const val = ethers.utils.parseUnits(amt, decimals);
  const tx = await token.approve(STAKING_CONTRACT, val);
  await tx.wait();
  alert("Approved");
}

/* ================= STAKE ================= */
async function stake() {
  const amt = document.getElementById("amount").value;
  if (!amt) return alert("Enter amount");

  const val = ethers.utils.parseUnits(amt, decimals);
  const tx = await staking.stake(val);
  stakeTxHash = tx.hash;

  await tx.wait();
  document.getElementById("stakeHash").innerText = stakeTxHash;
  loadStakeInfo();
}

/* ================= LOAD STAKE ================= */
async function loadStakeInfo() {
  const info = await staking.getStakeInfo(user);

  const staked = ethers.utils.formatUnits(info[0], decimals);
  const unlock = Number(info[2]) * 1000;

  document.getElementById("staked").innerText = staked;

  if (Number(info[0]) === 0) {
    document.getElementById("status").innerText = "NOT STAKED";
    document.getElementById("unlockDate").innerText = "--";
    document.getElementById("countdown").innerText = "--";
    return;
  }

  document.getElementById("unlockDate").innerText =
    new Date(unlock).toLocaleDateString();

  startCountdown(unlock);
}

/* ================= COUNTDOWN ================= */
function startCountdown(unlock) {
  const btn = document.getElementById("withdrawBtn");

  const timer = setInterval(() => {
    const diff = unlock - Date.now();

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Unlocked";
      document.getElementById("status").innerText = "READY TO WITHDRAW";
      btn.disabled = false;
      btn.className = "primary";
      clearInterval(timer);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);

    document.getElementById("countdown").innerText =
      d + "d " + h + "h " + m + "m";
  }, 1000);
}

/* ================= WITHDRAW ================= */
async function withdraw() {
  const tx = await staking.withdraw();
  await tx.wait();
  alert("Withdraw successful");
  loadStakeInfo();
}
