let provider, signer, user, token, staking;
let decimals = 18;
let timer;

async function connectWallet() {
  try {
    if (!eth) {
      alert("Open in MetaMask / TokenPocket / Trust Wallet DApp browser");
      return;
    }

    provider = new ethers.providers.Web3Provider(eth, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    user = await signer.getAddress();

    const net = await provider.getNetwork();
    if (net.chainId !== CHAIN_ID) {
      alert("Switch to BSC Mainnet");
      return;
    }

    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

    try { decimals = await token.decimals(); } catch {}

    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0,6) + "..." + user.slice(-4);

    const cbtn = document.getElementById("connectBtn");
    cbtn.innerText = "Wallet Connected";
    cbtn.disabled = true;
    cbtn.className = "gray";

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("approveBtn").className = "primary";

    document.getElementById("stakeBtn").disabled = false;
    document.getElementById("stakeBtn").className = "primary";

    loadStake();

  } catch (e) {
    console.error(e);
    alert("Wallet connection failed");
  }
}

async function approve() {
  const amt = document.getElementById("amount").value;
  if (!amt) return alert("Enter amount");

  const val = ethers.utils.parseUnits(amt, decimals);
  const tx = await token.approve(STAKING_CONTRACT, val);
  await tx.wait();
  alert("Approve successful");
}

async function stake() {
  const amt = document.getElementById("amount").value;
  if (!amt) return alert("Enter amount");

  const val = ethers.utils.parseUnits(amt, decimals);
  const tx = await staking.stake(val);
  await tx.wait();
  alert("Stake successful");
  loadStake();
}

async function withdraw() {
  const tx = await staking.withdraw();
  await tx.wait();
  alert("Withdraw successful");
  loadStake();
}

async function loadStake() {
  if (!staking || !user) return;

  const info = await staking.getStakeInfo(user);

  const staked = ethers.utils.formatUnits(info[0], decimals);
  document.getElementById("staked").innerText = staked;

  if (info[0].eq(0)) {
    document.getElementById("stakeStatus").innerText = "NOT STAKED";
    document.getElementById("withdrawBtn").disabled = true;
    document.getElementById("withdrawBtn").className = "gray";
    return;
  }

  document.getElementById("stakeStatus").innerText = "STAKED";

  const unlockTs = Number(info[2]) * 1000;
  document.getElementById("unlock").innerText =
    new Date(unlockTs).toLocaleDateString();

  startCountdown(unlockTs);
}

function startCountdown(unlock) {
  clearInterval(timer);

  timer = setInterval(() => {
    const diff = unlock - Date.now();
    const btn = document.getElementById("withdrawBtn");

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Unlocked";
      btn.disabled = false;
      btn.className = "primary";
      btn.innerText = "Withdraw GARV";
      clearInterval(timer);
    } else {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      document.getElementById("countdown").innerText =
        ${d}d ${h}h ${m}m;
      btn.disabled = true;
      btn.className = "gray";
    }
  }, 1000);
}
