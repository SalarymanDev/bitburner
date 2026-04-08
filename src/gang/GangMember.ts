import { NS } from '@ns'

export class GangMember {
	private name: string;

	constructor (private ns: NS, name: string) {
		this.name = name;
	}
}