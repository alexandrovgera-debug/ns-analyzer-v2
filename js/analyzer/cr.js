export default class CRAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    // === средний SR по интервалам CR ===
    buildIntervalSR(srRows) {

        const cr = this.profile?.cr || [];

        const result = [];

        for (let i = 0; i < cr.length; i++) {

            const current = cr[i];
            const next = cr[i + 1];

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
                cr: current.value
            });
        }

        return result;
    }

    // === расчет CR ===
    calculateCR(intervalSR) {

        const result = [];

        for (const i of intervalSR) {

            const currentCR = i.cr;
            const factor = 1 / (i.srAvg || 1);

            result.push({
                start: i.start,
                end: i.end,
                srAvg: i.srAvg,
                currentCR,
                suggestedCR: currentCR * factor
            });

        }

        return result;
    }

    toHour(timeStr) {

        const [h, m] = timeStr.split(":").map(Number);

        return h + m / 60;
    }
}
