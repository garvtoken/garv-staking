let provider, signer, user, token, staking, decimals = 18;
let timer;

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Open in MetaMask / TokenPocket / Trust Wallet DApp browser");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    user = await signer.getAddress();

    const net = await provider.getNetwork();
    if (net.chainId !== CHAIN_ID) {
      alert("Please switch to BSC Mainnet");
      return;
    }

    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

    try { decimals = await token.decimals(); } catch {}

    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0,6) + "..." + user.slice(-4);

    const btn = document.getElementById("connectBtn");
    btn.innerText = "Wallet Connected";
    btn.disabled = true;
    btn.className = "gray";

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("approveBtn").className = "primary";
    document.getElementById("stakeBtn").disabled = false;
    document.getElementById("stakeBtn").className = "primary";

    document.getElementById("garvAddr").innerText =
      GARV_TOKEN.slice(0,6) + "..." + GARV_TOKEN.slice(-4);
    document.getElementById("stakeAddr").innerText =
      STAKING_CONTRACT.slice(0,6) + "..." + STAKING_CONTRACT.slice(-4);

    loadLiveRate();
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
  document.getElementById("stakeTx").innerText =
    tx.hash.slice(0,10) + "...";
  await tx.wait();
  loadStake();
}

async function withdraw() {
  const tx = await staking.withdraw();
  await tx.wait();
  loadStake();
}

async function loadStake() {
  const info = await staking.getStakeInfo(user);
  document.getElementById("staked").innerText =
    ethers.utils.formatUnits(info[0], decimals);

  if (info[0].gt(0)) {
    document.getElementById("status").innerText = "STAKED";
    const unlock = Number(info[2]) * 1000;
    document.getElementById("unlockDate").innerText =
      new Date(unlock).toLocaleDateString();
    startTimer(unlock);
  }
}

function startTimer(unlock) {
  clearInterval(timer);
  timer = setInterval(() => {
    const diff = unlock - Date.now();
    const btn = document.getElementById("withdrawBtn");
    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Unlocked";
      btn.disabled = false;
      btn.className = "primary";
      btn.innerText = "Withdraw GARV";
    } else {
      const d = Math.floor(diff/86400000);
      const h = Math.floor(diff/3600000)%24;
      document.getElementById("countdown").innerText = ${d}d ${h}h;
    }
  }, 1000);
}

async function loadLiveRate() {
  try {
    const r = await fetch(
      "https://api.pancakeswap.info/api/v2/tokens/" + GARV_TOKEN
    );
    const j = await r.json();
    document.getElementById("liveRate").innerText =
      Number(j.data.price).toFixed(6);
  } catch {
    document.getElementById("liveRate").innerText = "Unavailable";
  }
}
