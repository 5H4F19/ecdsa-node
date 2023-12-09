const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const gen = () => {
  const pairs = [];
  for (let i = 0; i < 5; i++) {
    const privateKey = toHex(secp256k1.utils.randomPrivateKey());
    const publicKey = toHex(secp256k1.getPublicKey(privateKey));
    pairs.push({
      privateKey,
      publicKey,
      balance: Math.floor(Math.random() * 100),
    });
  }
  console.log(pairs);
};
module.exports = gen;
