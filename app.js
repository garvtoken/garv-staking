let provider;
let signer;
let userAddress;

const stakingAddress = "0xf5be3BbA8FB7cd06380b8D902eA976F0fAc8387F";

const stakingABI = [
  "function stake(uint256 amount)",
  "function getStakeInfo(address user) view returns(uint256,uint256,uint256,bool)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please open in MetaMask / TokenPocket browser");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletStatus").innerText =
      "Wallet: " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

  } catch (err) {
    alert("Wallet connection rejected");
    console.error(err);
  }
}

async function stake() {
  if (!signer) return alert("Connect wallet first");

  const amount = document.getElementById("amount").value;
  if (!amount || amount <= 0) return alert("Enter valid amount");

  const contract = new ethers.Contract(stakingAddress, stakingABI, signer);

  try {
    const tx = await contract.stake(
      ethers.utils.parseUnits(amount, 18)
    );
    alert("Transaction sent");
    await tx.wait();
    alert("Staked successfully");
  } catch (e) {
    alert("Stake failed");
    console.error(e);
  }
}

async function checkStake() {
  if (!signer) return alert("Connect wallet first");

  const contract = new ethers.Contract(stakingAddress, stakingABI, signer);

  try {
    const data = await contract.getStakeInfo(userAddress);
    alert(
      "Staked: " + ethers.utils.formatUnits(data[0], 18) +
      "\nUnlock: " + new Date(data[2] * 1000).toLocaleString()
    );
  } catch (e) {
    alert("Error fetching stake info");
    console.error(e);
  }
      }
