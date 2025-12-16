let provider, signer, token, staking, user;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask required");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  user = await signer.getAddress();

  token = new ethers.Contract(GARV_TOKEN, TOKEN_ABI, signer);
  staking = new ethers.Contract(STAKING_CONTRACT, STAKING_ABI, signer);

  document.getElementById("walletStatus").innerText =
    "Connected: " + user.slice(0, 6) + "..." + user.slice(-4);

  document.getElementById("approveBtn").disabled = false;
  document.getElementById("stakeBtn").disabled = false;

  loadStake();
}

async function approve() {
  const amt = ethers.utils.parseUnits(
    document.getElementById("amount").value,
    18
  );
  const tx = await token.approve(STAKING_CONTRACT, amt);
  await tx.wait();
  alert("Approved");
}

async function stake() {
  const amt = ethers.utils.parseUnits(
    document.getElementById("amount").value,
    18
  );
  const tx = await staking.stake(amt);
  await tx.wait();
  alert("Staked");
  loadStake();
}

async function withdraw() {
  const tx = await staking.withdraw();
  await tx.wait();
  alert("Withdrawn");
  loadStake();
}

async function loadStake() {
  if (!staking || !user) return;
  const info = await staking.getStakeInfo(user);
  document.getElementById("stakeInfo").innerText =
    info[0] > 0 ? "Active Stake" : "No active stake";
}
