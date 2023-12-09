import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import {secp256k1} from 'ethereum-cryptography/secp256k1'

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const privateKey = prompt("Enter your private Key")
      const tx = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      }
      const tx_to_uint8 = new TextEncoder().encode(JSON.stringify(tx))
      const messageHash = keccak256(tx_to_uint8)

      const signature = secp256k1.sign(messageHash,privateKey).toCompactHex();

      console.log({
        signature,
        messageHash,
        tx
      })

      const {
        data: { balance },
      } = await server.post(`send`, {
        tx,
        signature
      });
      setSendAmount("")
      setRecipient("")
      setBalance(balance);
    } catch (ex) {
      setBalance(ex.response?.data?.balance);
      alert(ex.response?.data?.message)
      console.log(ex)
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
