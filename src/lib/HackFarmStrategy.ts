import { NS } from '@ns'

export class HackFarmStrategy {
    securityThreshold: number;
    moneyThreshold: number;

	constructor(private ns: NS, private target: string) {
		this.securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
		this.moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
	}

	async run(): Promise<void> {
		while (true) {
			if (this.ns.getServerSecurityLevel(this.target) > this.securityThreshold) {
				await this.ns.weaken(this.target);
			} else if (this.ns.getServerMoneyAvailable(this.target) < this.moneyThreshold) {
				await this.ns.grow(this.target);
			} else {
				await this.ns.hack(this.target);
			}
		}
	}
}