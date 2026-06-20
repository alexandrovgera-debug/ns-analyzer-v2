export default class ISFAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    // === средний SR по интервалам ISF ===
    buildIntervalSR(srRows) {

        const isf = this.profile?.isf || [];

        const result = [];

        for (let i = 0; i < isf.length; i++) {

            const current = isf[i];
            const next = isf[i + 1];

            const start = this.toHour(current.time);
            const end = next ? this.toHour(next.time) : 24;

            let sum = 0;
            let count = 0;

            for (const row of srRows || []) {

                const time = new Date(row.time);
                const hour = time.getHours() + time.getMinutes() / 60;

                if (hour >= start && hour < end) {
                    sum += (row.sr ?? 1);
                    count++;
                }
            }

            result.push({
                start,
                end,
                srAvg: count ? sum / count : 1,
                isf: current.value
            });
        }

        return result;
    }

    // === расчет ISF ===
    calculateISF(intervalSR) {

        const result = [];

        for (const i of intervalSR) {

            const currentISF = i.isf;
            const factor = 1 / (i.srAvg || 1);

            result.push({
                start: i.start,
                end: i.end,
                srAvg: i.srAvg,
                currentISF,
                suggestedISF: currentISF * factor
            });

        }

        return result;
    }

    toHour(timeStr) {

        const [h, m] = timeStr.split(":").map(Number);

        return h + m / 60;
    }
}