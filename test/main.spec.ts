import { Address, Cell, toNano } from "@ton/core";
import { hex } from "../build/main.compiled.json";
import { Blockchain } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton/test-utils";

describe("main.fc contract tests", () => {
  it("should get the proper most recent sender address", async () => {
    const blockchain = await Blockchain.create();
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    const myContract = blockchain.openContract(
      MainContract.createFromConfig({}, codeCell)
    );

    const senderWallet = await blockchain.treasury("sender");

    var data = await myContract.getData();
    expect(data.recent_sender.equals(senderWallet.address)).toBeFalsy;
    
    const sentMessageResult = await myContract.sendInternalMessage(
      senderWallet.getSender(),
      toNano("0.05")
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    data = await myContract.getData();

    expect(data.recent_sender.equals(senderWallet.address)).toBeTruthy;
  });
});