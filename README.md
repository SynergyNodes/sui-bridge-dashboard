# Sui Bridge Dashboard Monitor

NOTE: Historical Data is Temporary. The Data is reset if you refresh the webpage.

LIVE PREVIEW: https://sui-bridge-dashboard.synergynodes.com

## Features:
* Status
* Uptime
* Gas Balance
* Cache Performance
* Ethereum Network Activity
* Sui Network Activity
* Gas Balance History
* Cache Hit Ratio History
* ETH Action Verifier Data
* SUI Action Verifier Data

## System Requirements
```
2 vCPU
4 GB RAM
Ubuntu 22.04
```

## Installation

```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g

git clone https://github.com/SynergyNodes/sui-bridge-dashboard.git
cd sui-bridge-dashboard

# Add Your Mainnet and Testnet Brige IPs in .env file
nano .env

NEXT_PUBLIC_MAINNET_BRIDGE_URL=http://<ip-address>:9184/metrics
NEXT_PUBLIC_TESTNET_BRIDGE_URL=http://<ip-address>:9184/metrics
NEXT_PUBLIC_DEFAULT_NETWORK=MAINNET_BRIDGE

# Save the file

npm i
yarn run build
pm2 start ecosystem.config.js
```

Open ``http://<ip-address-of-this-server>:3000`` with your browser to see the result.

## Preview

<img src="https://raw.githubusercontent.com/SynergyNodes/general_images/refs/heads/main/sui-bridge-dashboard/sui-bridge-dashboard-1.png" width="750">
<img src="https://raw.githubusercontent.com/SynergyNodes/general_images/refs/heads/main/sui-bridge-dashboard/sui-bridge-dashboard-2.png" width="750">
<img src="https://raw.githubusercontent.com/SynergyNodes/general_images/refs/heads/main/sui-bridge-dashboard/sui-bridge-dashboard-3.png" width="750">
<img src="https://raw.githubusercontent.com/SynergyNodes/general_images/refs/heads/main/sui-bridge-dashboard/sui-bridge-dashboard-4.png" width="750">
