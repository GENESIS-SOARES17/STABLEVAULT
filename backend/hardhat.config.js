require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const isValidKey = PRIVATE_KEY && /^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY.replace(/^0x/, ""));

module.exports = {
  solidity: "0.8.22",
  networks: {
    liteforge: {
      url: "https://liteforge.rpc.caldera.xyz/http",
      chainId: 4441,
      accounts: isValidKey ? [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : "0x" + PRIVATE_KEY] : []
    }
  }
};
