import { NS } from '@ns'

export class TargetRanker {
    constructor(private ns: NS) {}

    public rank(hosts: string[]): string[] {
        const hostData: HostData[] = this.normalizeData(hosts.map(this.fetchData));
        const rankings: RankRecord[] = hostData.map(this.calculateRank);

        return rankings.sort((a: RankRecord, b: RankRecord) => {
            if (a.rank < b.rank) {
                return -1;
            } else if (a.rank > b.rank) {
                return 1;
            }
            return 0;
        }).map(rank => rank.host);
    }

    private calculateRank(data: HostData): RankRecord {
        return {
            host: data.host,
            rank: (data.minSecurity * -1) + data.maxMoney + data.growth
        };
    }

    private normalizeData(hostData: HostData[]): HostData[] {
        let maxMinSecurity = hostData[0].minSecurity;
        let minMinSecurity = hostData[0].minSecurity;
        let maxMaxMoney = hostData[0].maxMoney;
        let minMaxMoney = hostData[0].maxMoney;

        hostData.forEach(data => {
            if (data.minSecurity > maxMinSecurity) {
                maxMinSecurity = data.minSecurity;
            } else if (data.minSecurity < minMinSecurity) {
                minMinSecurity = data.minSecurity;
            }

            if (data.maxMoney > maxMaxMoney) {
                maxMaxMoney = data.maxMoney;
            } else if (data.maxMoney < minMaxMoney) {
                minMaxMoney = data.maxMoney;
            }
        });

        return hostData.map(data => {
            return {
                host: data.host,
                minSecurity: this.normalize(data.minSecurity, minMinSecurity, maxMinSecurity),
                maxMoney: this.normalize(data.maxMoney, minMaxMoney, maxMaxMoney),
                growth: this.normalize(data.growth, 0, 100)
            }
        })
    }

    private normalize(value: number, min: number, max: number): number {
        return (value - min) / (max - min);
    }

    private fetchData(host: string): HostData {
        return {
            host: host,
            minSecurity: this.ns.getServerMinSecurityLevel(host),
            maxMoney: this.ns.getServerMaxMoney(host),
            growth: this.ns.getServerGrowth(host)
        }
    }
}

interface RankRecord {
    host: string,
    rank: number
}

interface HostData {
    host: string,
    minSecurity: number,
    maxMoney: number,
    growth: number
}