const express = require("express");
const app = express();
const cors = require("cors");
const gen = require("./scripts/gen");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

const port = 3042;
app.use(cors());
app.use(express.json());

const balances = {
  "029c08a1be1b6b11fe7d75c00fcbb67ca4456a4122e9eaf1b6555719a22ca9a1f2": 100,
  "0312a3cf9ed79479ec3de2f277324858f9b0005e608c70bd033f99ff75d9382e7e": 50,
  "02d7d3c8589e979acb1ca06dc798a73bdb4de2f6991a8f1cad0ab83c0377fb09cd": 75,
};

const array = [
  {
    privateKey:
      "d1d93731538b7b750f61ca992e4e566ae5b447e48fe5b60401ed7632b8e9b530",
    publicKey:
      "029c08a1be1b6b11fe7d75c00fcbb67ca4456a4122e9eaf1b6555719a22ca9a1f2",
    balance: 95,
  },
  {
    privateKey:
      "19e79b5185614ca155ba2db4d61a1c59e00223b8a36f32aa63f5b69d07430ea0",
    publicKey:
      "0312a3cf9ed79479ec3de2f277324858f9b0005e608c70bd033f99ff75d9382e7e",
    balance: 30,
  },
  {
    privateKey:
      "825c4666befb3b21e50a52c4a1369795a263fd752ca3247f517c8cc3d150162b",
    publicKey:
      "02f8e875e310b1c4e845100a42005780509c27129570fc3c5cf22c62c1f59a6cf2",
    balance: 33,
  },
  {
    privateKey:
      "ccbb2ec2273c5036147aa69134a6a20a958bee53d941d1a42f4e546789a02893",
    publicKey:
      "02d7d3c8589e979acb1ca06dc798a73bdb4de2f6991a8f1cad0ab83c0377fb09cd",
    balance: 72,
  },
  {
    privateKey:
      "a523b5369a0399f1427e7ce239ac753702eb6c67539e493cf5e0dc6f9f293bae",
    publicKey:
      "02dc33fdd8f3b8302b32e9c80f2fb99084b86f3b586a449f29cd05bc1ddb5ff222",
    balance: 46,
  },
];

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  try {
    const { signature, tx } = req.body;
    console.log(signature, tx);
    const tx_to_uint8 = new TextEncoder().encode(JSON.stringify(tx));
    const messageHash = keccak256(tx_to_uint8);
    const isValid = secp256k1.verify(signature, messageHash, tx.sender);

    if (isValid) {
      const sender = tx.sender;
      const recipient = tx.recipient;
      const amount = tx.amount;
      const senderBalance = balances[sender];
      const receiverBalance = balances[recipient];

      console.log({ tx });

      if (senderBalance >= amount) {
        balances[sender] = senderBalance - amount;
        balances[recipient] = receiverBalance + amount;
        res.send({
          status: "success",
          message: "Transaction successful",
          balance: balances[sender],
        });
      } else {
        res.status(400).send({
          status: "error",
          message: "Insufficient balance",
          balance: balances[sender],
        });
      }
    } else {
      res.status(400).send({
        status: "error",
        message: "Invalid signature",
        balance: balances[sender],
      });
    }
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: "Invalid signature",
      balance: balances[sender],
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
