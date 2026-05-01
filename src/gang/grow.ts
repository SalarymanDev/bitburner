import { NS } from '@ns'

const ascendTheshold = 1.2;
let memberNameCounter = 0;
const multiplierRankToRespectTask = new Map<number, string>([
	[0, "Mug People"],
	[1, "Strongarm Civilians"],
	[2, "Traffick Illegal Arms"],
	[3, "Terrorism"],
]);

export async function main(ns : NS) : Promise<void> {
	ns.disableLog('ALL');

	ns.gang.renameMember('10', '5');
	initGang(ns);
	await train(ns, 3);
	await growGang(ns, 2, 6);
	await train(ns, 15);
	await growGang(ns, 2, 12);

	// Train for war!
	await train(ns, 15);

	ns.print('SUCCESS: Gang Grown!');
	ns.spawn('gang/war.js', {spawnDelay: 0});
}

function initGang(ns: NS): void {
	memberNameCounter += ns.gang.getMemberNames().length;

	while(ns.gang.canRecruitMember()) {
		ns.gang.recruitMember(`${memberNameCounter++}`);
	}
}

async function train(ns: NS, minimumMultiplier: number): Promise<void> {
	ns.print(`Training Gang to Minimum Multiplier ${minimumMultiplier}...`);
	const gangMembersCompleted = new Set();
	while(true) {
		const gangMembers = ns.gang.getMemberNames();

		for (const member of gangMembers) {
			if (ns.gang.getMemberInformation(member).task != 'Train Combat') {
				ns.gang.setMemberTask(member, 'Train Combat');
			}
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
		if (gangMembersCompleted.size == ns.gang.getMemberNames().length) {
			ns.print(`SUCCESS: Gang Trained to Minimum Multiplier ${minimumMultiplier}`);
			return;
		}
		await ns.gang.nextUpdate();
	}
}

function calculateCombatRank(ns: NS, member: string): number {
	const info = ns.gang.getMemberInformation(member);
	if (info.str_asc_mult < 2) {
		return 0;
	} else if (info.str_asc_mult < 15) {
		return 1;
	} else if (info.str_asc_mult < 20) {
		return 2;
	} else {
		return 3;
	}
}

async function growGang(ns: NS, vigilanteAmount: number, targetMembers: number): Promise<void> {
	let recruited = 0;
	const numberToRecruit = targetMembers - ns.gang.getMemberNames().length;
	if (numberToRecruit <= 0) {
		ns.print(`SUCCESS: Gang already at Target Members ${targetMembers}!`);
		return;
	}
	ns.print(`Recruiting ${numberToRecruit} members for target members ${targetMembers}...`);

	while(true) {
		if (ns.gang.respectForNextRecruit() == Infinity) {
			ns.print('SUCCESS: Gang at Capacity!');
			return;
		}


		if (ns.gang.canRecruitMember()) {
			ns.gang.recruitMember(`${memberNameCounter++}`);
			recruited++;
			if (recruited == numberToRecruit) {
				ns.print(`SUCCESS: Gang Increased to Target Members ${targetMembers}!`);
				return;
			}
		}

		const gangMembers = ns.gang.getMemberNames().sort((a, b) => {
			return ns.gang.getMemberInformation(a).str_asc_mult - ns.gang.getMemberInformation(b).str_asc_mult;
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