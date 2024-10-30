import { Cell, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { SumContract } from "../wrappers/SumContract";
import "@ton/test-utils";
import { compile } from "@ton/blueprint";

describe("sum.fc contract tests", () => {
  let blockchain: Blockchain;
  let myContract: SandboxContract<SumContract>;
  let initWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile("SumContract");
  });

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury("initWallet");

    myContract = blockchain.openContract(
      SumContract.createFromConfig(
        {
          number: 0,
          address: initWallet.address
        },
        codeCell
      )
    );
  });

  it("should get the correct sum of numbers", async () => {
    const senderWallet = await blockchain.treasury("sender");

    var sentMessageResult = await myContract.sendIncrement(
      senderWallet.getSender(),
      toNano("0.001"),
      1
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    sentMessageResult = await myContract.sendIncrement(
      senderWallet.getSender(),
      toNano("0.001"),
      2
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const number = await myContract.getData();
    expect(number).toEqual(3);
  });

});