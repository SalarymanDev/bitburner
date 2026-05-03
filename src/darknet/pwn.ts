import { NS } from '@ns'

const primeNumbers = ['2', '3', '5', '7', '11', '13', '17', '19', '23', '29', '31', '37', '41', '43', '47', '53', '59', '61', '67', '71', '73', '79', '83', '89', '97', '101', '103', '107', '109', '113', '127', '131', '137', '139', '149', '151', '157', '163', '167', '173', '179', '181', '191', '193', '197', '199', '211', '223', '227', '229', '233', '239', '241', '251', '257', '263', '269', '271', '277', '281', '283', '293', '307', '311', '313', '317', '331', '337', '347', '349', '353', '359', '367', '373', '379', '383', '389', '397', '401', '409', '419', '421', '431', '433', '439', '443', '449', '457', '461', '463', '467', '479', '487', '491', '499', '503', '509', '521', '523', '541', '547', '557', '563', '569', '571', '577', '587', '593', '599', '601', '607', '613', '617', '619', '631', '641', '643', '647', '653', '659', '661', '673', '677', '683', '691', '701', '709', '719', '727', '733', '739', '743', '751', '757', '761', '769', '773', '787', '797', '809', '811', '821', '823', '827', '829', '839', '853', '857', '859', '863', '877', '881', '883', '887', '907', '911', '919', '929', '937', '941', '947', '953', '967', '971', '977', '983', '991', '997'];

interface Log {
	code: number;
	message: string;
	data: string;
	passwordAttempted?: string;
}

export async function main(ns : NS) : Promise<void> {
	// ns.tprint(ns.getHostname());
	for (const cacheFile of ns.ls(ns.getHostname(), '.cache')) {
		ns.dnet.openCache(cacheFile);
	}

	const passwordMap: Map<string, string> = ns.peek(10) !== 'NULL PORT DATA' ? ns.peek(10) : new Map<string, string>();

	for (const neighbor of ns.dnet.probe()) {
		const password = passwordMap.has(neighbor) ? passwordMap.get(neighbor) : await crackPassword(ns, neighbor);
		if (password === null) continue;
		await ns.dnet.connectToSession(neighbor, password);
		// ns.tprint(`${ns.getHostname()}: Spreading to ${neighbor}`);
		if (ns.dnet.getBlockedRam(neighbor) > 0) {
			await ns.dnet.memoryReallocation(neighbor);
		}
		ns.scp('darknet/pwn.js', neighbor, 'home');
		ns.exec('darknet/pwn.js', neighbor);
	}

	// await ns.sleep(5000);
}

async function attemptPassword(ns: NS, host: string, password: string, hint: string, format: string, length: number, suppressLog = false): string | null {
	const result = await ns.dnet.authenticate(host, password);

	if (!suppressLog && !result.success) {
		ns.tprint(`ERROR:${ns.getHostname()}: Failed to authenticate with password '${password}' on '${host}' with details:\n\tHint: ${hint}\n\tFormat: ${format}\n\tLength: ${length}`);
	}
	
	if (result.success) {
		// Update password db
		ns.writePort(11, { host: host, password: password });
	}

	return result.success ? password : null;
}

async function crackPassword(ns: NS, host: string): string | null {
	const authDetails = ns.dnet.getServerAuthDetails(host);
	const hint = authDetails.passwordHint;
	const length = authDetails.passwordLength;
	const format = authDetails.passwordFormat;
	const data = authDetails.data;

	if (length == 0) {
		return await attemptPassword(ns, host, '', hint, format, length);
	} else if (hint == 'The password is divisible by 1 ;)') {
		for (const primeNumber of primeNumbers) {
			if (primeNumber.length != length) continue;
			const result = await attemptPassword(ns, host, primeNumber, hint, format, length, true);
			if (result != null) {
				return result;
			}
		}
	} else if (hint == 'Type the numbers to prove you are human') {
		return await attemptPassword(ns, host, data.replace(/\D/g, ''), hint, format, length);
	} else if (hint == 'The password is a number between 0 and 100') {
		for (let i = 0; i < 100; i++) {
			const result = await attemptPassword(ns, host, i.toString(), hint, format, length, true);
			if (result !== null) {
				return result;
			}
		}
	} else if (hint == 'The default password is set' || hint == "It's still the factory settings" || hint == 'I never changed the password' || hint == 'The password is the default password' || hint == "It's still the default") {
		if (length == 5 && format == 'numeric') {
			const result = await attemptPassword(ns, host, '12345', hint, format, length, true);
			if (result === null) {
				return await attemptPassword(ns, host, '00000', hint, format, length);
			} else {
				return result;
			}
		} else if (length == 5 && format == 'alphabetic') {
			return await attemptPassword(ns, host, 'admin', hint, format, length);
		} else if (length == 8 && format == 'alphabetic') {
			return await attemptPassword(ns, host, 'password', hint, format, length);
		} else if (length == 4 && format == 'numeric') {
			return await attemptPassword(ns, host, '0000', hint, format, length);
		}
	} else if (hint == 'Only a true master may pass' && format == 'numeric') {
		const digits: string[] = [];
		for (let i = 0; i < length; i++) {
			for (let n = 0; n < 9; n++) {
				const authResult = await ns.dnet.authenticate(host, digits.join('') + n.toString());
				if (authResult.success) return digits.join('') + n.toString();
				const result = await ns.dnet.heartbleed(host, { peek: true });
				ns.tprint(`${host}: ${result.logs[0]}`);
			}
		}
	} else if (hint == "you are one who's'nt authorized") {
		const digits: string[] = [];
		for (let i = 0; i < length; i++) {
			for (let n = 0; n < 9; n++) {
				const authResult = await ns.dnet.authenticate(host, digits.join('') + n.toString());
				if (authResult.success) return digits.join('') + n.toString();
				const result = await ns.dnet.heartbleed(host, { peek: true });
				const log: Log = JSON.parse(result.logs[0]);
				ns.tprint(`${host}: ${log.data}`);
				if (log.data.split(',')[0] > i) {
					digits.push(n.toString());
					break;
				}
				// if (!result.data.includes("yesn't")) {
				// 	digits.push(n.toString());
				// 	break;
				// }
			}
		}
	} else if (hint == 'The password is the value of the number ') {
		// roman numeral 'CLXX'
		// return await attemptPassword(ns, host, '', hint, format, length);
	} else if (hint.includes('the password is the base ')) {
		// the password is the base 15 number 2D in base 10
		const stringParts = hint.replace('the password is the base ', '').replace('number ', '').replace('in base ', '').split(' ');
		const sourceBase = +stringParts[0];
		const number = parseInt(stringParts[1], sourceBase);
		return await attemptPassword(ns, host, number.toString(), hint, format, length);
	} else if (hint.includes('The key is made from ')) {
		const baseString = hint.replace('The key is made from ', '');
		const permutations = findPermutation(baseString);
		for (const permutation of permutations) {
			const result = await attemptPassword(ns, host, permutation, hint, format, length, true);
			if (result !== null) {
				return result;
			}
		}
	} else if (hint.includes('Warning: password buffer is ')) {
		await ns.dnet.authenticate(host, 'abcdefghijklmnopqrstuvwxyz0123456789');
		const result = await ns.dnet.heartbleed(host);
		ns.tprint(`WARN: ${result.message} ${result.code} ${result.data} ${result.logs}`);
		// const baseString = result.message.split(', ')[1].replace('expected', '').replace('\'', '');
		// const permutations = findPermutation(baseString);
		// for (const permutation of permutations) {
		// 	const result = await attemptPassword(ns, host, permutation, hint, format, length);
		// 	if (result !== null) {
		// 		return result;
		// 	}
		// }
	} else if (hint.includes('The PIN is ')) {
		return await attemptPassword(ns, host, hint.replace('The PIN is ', ''), hint, format, length);
	} else if (hint.includes('Remember to use ')) {
		return await attemptPassword(ns, host, hint.replace('Remember to use ', ''), hint, format, length);
	} else if (hint.includes('The key is ', '')) {
		return await attemptPassword(ns, host, hint.replace('The key is ', ''), hint, format, length);
	} else if (hint.includes("It's set to ")) {
		return await attemptPassword(ns, host, hint.replace("It's set to ", ''), hint, format, length);
	} else if (hint.includes('The password is ')) {
		return await attemptPassword(ns, host, hint.replace('The password is ', ''), hint, format, length);
	} else if (hint.includes('The secret is ')) {
		return await attemptPassword(ns, host, hint.replace('The secret is ', ''), hint, format, length);
	}


	ns.tprint(`ERROR:${ns.getHostname()}: Failed to attempt on '${host}' with details:\n\tHint: ${hint}\n\tFormat: ${format}\n\tLength: ${length}`);

	return null;
}

function recursePermute(index, stringParts, result) {
    if (index === stringParts.length) {
        result.push(stringParts.join('')); 
        return;
    }

    for (let i = index; i < stringParts.length; i++) {
        // swap
        [stringParts[index], stringParts[i]] = [stringParts[i], stringParts[index]];

        recursePermute(index + 1, stringParts, result);

        // backtrack
        [stringParts[index], stringParts[i]] = [stringParts[i], stringParts[index]];
    }
}

function findPermutation(s: string): Set<string> {
    const result: string[] = [];
    const stringParts = s.split('');

    recursePermute(0, stringParts, result);

    result.sort(); 
    return new Set(result);
}