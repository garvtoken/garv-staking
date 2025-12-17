let provider, signer, user, token, staking;
let decimals = 18;
let timer = null;

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please open in MetaMask / TokenPocket browser");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    user = await signer.getAddress();

    const net = await provider.getNetwork();
    if (net.chainId !== CHAIN_ID) {
      alert("Please switch to BSC Mainnet (56)");
      return;
    }

    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

    try {
      decimals = await token.decimals();
    } catch {
      decimals = 18;
    }

    document.getElementById("walletStatus").innerText =
      Connected: ${user.slice(0,6)}...${user.slice(-4)};

    document.getElementById("approveBtn").disabled = false;
    document.getElementById("stakeBtn").disabled = false;

    loadStake();

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

async function approve() {
  try {
    const amt = document.getElementById("amount").value;
    if (!amt) return alert("Enter staking amount");

    const val = ethers.utils.parseUnits(amt, decimals);
    document.getElementById("approveBtn").disabled = true;

    const tx = await token.approve(STAKING_CONTRACT, val);
    await tx.wait();

    alert("Approve successful");
    document.getElementById("stakeBtn").disabled = false;
  } catch (e) {
    alert("Approve failed or rejected");
  } finally {
    document.getElementById("approveBtn").disabled = false;
  }
}

async function stake() {
  try {
    const amt = document.getElementById("amount").value;
    if (!amt) return alert("Enter staking amount");

    const val = ethers.utils.parseUnits(amt, decimals);
    document.getElementById("stakeBtn").disabled = true;

    const tx = await staking.stake(val);
    await tx.wait();

    alert("Stake successful");
    loadStake();
  } catch (e) {
    alert("Stake failed or rejected");
  } finally {
    document.getElementById("stakeBtn").disabled = false;
  }
}

async function withdraw() {
  try {
    document.getElementById("withdrawBtn").disabled = true;

    const tx = await staking.withdraw();
    await tx.wait();

    alert("Withdraw successful");
    loadStake();
  } catch (e) {
    alert("Withdraw failed or still locked");
  }
}

async function loadStake() {
  if (!staking || !user) return;

  const info = await staking.getStakeInfo(user);

  const stakedAmt = ethers.utils.formatUnits(info[0], decimals);
  document.getElementById("staked").innerText = stakedAmt;

  const unlockTime = Number(info[2]) * 1000;
  startTimer(unlockTime);
}

function startTimer(unlock) {
  if (timer) clearInterval(timer);

  const btn = document.getElementById("withdrawBtn");
  btn.disabled = true;

  timer = setInterval(() => {
    const diff = unlock - Date.now();

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Unlocked";
      btn.disabled = false;
      clearInterval(timer);
    } else {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;

      document.getElementById("countdown").innerText =
        ${d}d ${h}h ${m}m;
    }
  }, 1000);
}
