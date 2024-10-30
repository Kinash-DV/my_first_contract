import { Address,beginCell,Cell,Contract, contractAddress, ContractProvider, Sender, SendMode } from "@ton/core";


export type SumContractConfig ={
	address: Address;
	number: number;
};

export function SumContractConfigToCell(config: SumContractConfig): Cell{
	return beginCell()
		.storeAddress(config.address)
		.storeUint(config.number,32)
		.endCell();
} 

export class SumContract implements Contract {
	constructor(
		readonly address: Address,
		readonly init?: { code: Cell, data: Cell }
	){}

	static createFromConfig(config: SumContractConfig, code: Cell, workchain = 0){
		const data = SumContractConfigToCell(config);
		const init = { code,data };
		const address = contractAddress(workchain, init);

		return new SumContract(address,init);
	}

	async sendIncrement(
		provider: ContractProvider,
		sender: Sender,
		value: bigint,
		increment_by: number,
	){

		const msg_body = beginCell().storeUint(increment_by,32).endCell();
		await provider.internal(sender,{
			value,
			sendMode: SendMode.PAY_GAS_SEPARATELY,
			body: msg_body,
		});
	}

	async getData(provider: ContractProvider) {
		const result = await provider.get('get_sum', []);
		return result.stack.readNumber();
	}

}