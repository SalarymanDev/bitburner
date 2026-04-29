import { NS } from '@ns'

const ascendTheshold = 1.1;
let memberNameCounter = 0;
const multiplierRankToRespectTask = new Map<number, string>([
	[0, "Mug People"],
	[1, "Deal Drugs"],
	[2, "Strongarm Civilians"],
	[3, "Run a Con"],
	[4, "Traffick Illegal Arms"],
	[5, "Terrorism"]
]);

export async function main(ns : NS) : Promise<void> {
	ns.disableLog("sleep");

	initGang(ns);
	await train(ns, 10);
	await growGang(ns, 2, 2);
	await train(ns, 20);
	await growGang(ns, 2, 2);
	await train(ns, 30);
	await growGang(ns, 2, 2);
	await train(ns, 50);

	ns.print('SUCCESS: Gang Grown!');
	ns.spawn('gang/war.js')
}

function initGang(ns: NS): void {
	while(ns.gang.canRecruitMember()) {
		ns.gang.recruitMember(`${memberNameCounter++}`);
	}
}

async function train(ns: NS, minimumMultiplier: number): Promise<void> {
	const gangMembersCompleted = new Set();
	while(true) {
		const gangMembers = ns.gang.getMemberNames();

		for (const member of gangMembers) {
			ns.gang.setMemberTask(member, 'Train Combat');
		}

		for (const member of gangMembers) {
			const memberInfo = ns.gang.getMemberInformation(member);
			if (!gangMembersCompleted.has(member) && memberInfo.str_asc_mult > minimumMultiplier && memberInfo.def_asc_mult > minimumMultiplier && memberInfo.dex_asc_mult > minimumMultiplier && memberInfo.agi_asc_mult > minimumMultiplier) {
				gangMembersCompleted.add(member);
			}

			const ascResult = ns.gang.getAscensionResult(member);
			if (ascResult && ascResult.str >= ascendTheshold && ascResult.def >= ascendTheshold && ascResult.agi >= ascendTheshold && ascResult.dex >= ascendTheshold) {
				ns.gang.ascendMember(member);
			}
		}
		if (gangMembersCompleted.size() == ns.gang.getMemberNames().length) {
			ns.print(`SUCCESS: Gang Trained to Minimum Multiplier ${minimumMultiplier}`);
			return;
		}
		await ns.gang.nextUpdate();
	}
}

function calculateCombatRank(ns: NS, member: string): number {
	const info = ns.gang.getMemberInformation(member);
	if (info.str_asc_mult < 10) {
		return 0;
	} else if (info.str_asc_mult < 20) {
		return 1;
	} else if (info.str_asc_mult < 30) {
		return 2;
	} else if (info.str_asc_mult < 40) {
		return 3;
	} else if (info.str_asc_mult < 50) {
		return 4;
	} else {
		return 5;
	}
}

async function growGang(ns: NS, vigilanteAmount: number, numberOfNewMembers: number): Promise<void> {
	let recruited = 0;

	while(true) {
		if (ns.gang.respectForNextRecruit() == Infinity) {
			ns.print('SUCCESS: Gang at Capacity!');
			return;
		}


		if (ns.gang.canRecruitMember()) {
			ns.gang.recruitMember(`${memberNameCounter++}`);
			recruited++;
			if (recruited == numberOfNewMembers) {
				return;
			}
		}

		const gangMembers = ns.gang.getMemberNames();
		gangMembers.sort((a, b) => {
			return ns.gang.getMemberInformation(b).str_asc_mult - ns.gang.getMemberInformation(a).str_asc_mult;
		});

		let vigilantes = 0;
		for (const member of gangMembers) {
			if (vigilantes < vigilanteAmount) {
				ns.gang.setMemberTask(member, 'Vigilante Justice');
				vigilantes++;
			} else {
				const rank = calculateCombatRank(ns, member);
				ns.gang.setMemberTask(member, multiplierRankToRespectTask.get(rank));
			}
		}

		await ns.gang.nextUpdate();
	}
}