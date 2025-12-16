let provider, signer, token, staking, user, decimals;

// ================= CONNECT WALLET =================
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please open this DApp inside TokenPocket / MetaMask browser");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    if (network.chainId !== 56) {
      alert("Please switch to BSC Mainnet");
      return;
    }

    signer = provider.getSigner();
    user = await signer.getAddress();

    token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
    staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

    decimals = await token.decimals();

    document.getElementById("walletStatus").innerText =
      "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);

    if (document.getElementById("approveBtn"))
      document.getElementById("approveBtn").disabled = false;

    if (document.getElementById("stakeBtn"))
      document.getElementById("stakeBtn").disabled = false;

    loadStake();

  } catch (err) {
    console.error("Connect error:", err);
    alert("Wallet connection failed. Reload and try again.");
  }
}

// ================= APPROVE =================
async function approve() {
  try {
    const value = document.getElementById("amount").value;
    if (!value || value <= 0) {
      alert("Enter valid amount");
      return;
    }

    const amt = ethers.utils.parseUnits(value, decimals);
    const tx = await token.approve(STAKING_CONTRACT, amt);
    await tx.wait();

    alert("Approval successful");

  } catch (err) {
    console.error("Approve error:", err);
    alert("Approve failed");
  }
}

// ================= STAKE =================
async function stake() {
  try {
    const value = document.getElementById("amount").value;
    if (!value || value <= 0) {
      alert("Enter valid amount");
      return;
    }

    const amt = ethers.utils.parseUnits(value, decimals);
    const tx = await staking.stake(amt);
    await tx.wait();

    alert("Staking successful");
    loadStake();

  } catch (err) {
    console.error("Stake error:", err);
    alert("Stake failed");
  }
}

// ================= WITHDRAW =================
async function withdraw() {
  try {
    const tx = await staking.withdraw();
    await tx.wait();

    alert("Withdraw successful");
    loadStake();

  } catch (err) {
    console.error("Withdraw error:", err);
    alert("Withdraw failed or still locked");
  }
}

// ================= LOAD STAKE INFO =================
async function loadStake() {
  try {
    if (!staking || !user) return;

    const info = await staking.getStakeInfo(user);
    const amount = ethers.utils.formatUnits(info[0], decimals);

    document.getElementById("stakeInfo").innerText =
      info[0] > 0
        ? Active Stake: ${amount} GARV
        : "No active stake";

  } catch (err) {
    console.error("Load stake error:", err);
  }
}
