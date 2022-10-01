export class NumberFormatter {
    public static format(amount: number): string {
        let num = Math.abs(amount);
        const symbols = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc'];
        for (const symbol of symbols) {
            if (num >= 1000) {
                num /= 1000;
                continue;
            }

            return (amount < 0 ? '-' : '') + num.toFixed(3) + symbol;
        }

        return (amount < 0 ? '-' : '') + Math.abs(amount).toFixed(3);
    }

    public static formatMoney(amount: number): string {
        let num = Math.abs(amount);
        const symbols = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc'];
        for (const symbol of symbols) {
            if (num >= 1000) {
                num /= 1000;
                continue;
            }

            return (amount < 0 ? '-$' : '$') + num.toFixed(3) + symbol;
        }

        return (amount < 0 ? '-$' : '$') + Math.abs(amount).toFixed(3);
    }
}