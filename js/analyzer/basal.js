export default class BasalAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    // === расчет усредненного SR по часам ===
    buildHourlySR(srRows) {

        const HOURS = 24;

        const hours = Array.from({ length: HOURS }, () => ({
            sum: 0,
            count: 0,
            avg: 1
        }));

        for (const row of srRows || []) {

            const sr = row.sr;
            const time = new Date(row.time);

            const h = time.getHours();

            if (sr === undefined || sr === null) continue;

            hours[h].sum += sr;
            hours[h].count += 1;
        }

        for (const h of hours) {

            if (h.count > 0) {
                h.avg = h.sum / h.count;
            }
        }

        return hours;
    }

    // === базал профиль ===
    getBasalByHour(hour) {

        const basal = this.profile?.basal || [];

        for (let i = 0; i < basal.length; i++) {

            const current = basal[i];
            const next = basal[i + 1];

            const start = this.toHour(current.time);
            const end = next ? this.toHour(next.time) : 24;

            if (hour >= start && hour < end) {
                return current.value;
            }
        }

        return 0;
    }

    toHour(timeStr) {

        // "04:30" → 4.5
        const [h, m] = timeStr.split(":").map(Number);

        return h + m / 60;
    }

    // === расчет нового базала ===
    calculateSuggestedBasal(hourSR, treatmentsByHour) {

        const result = Array(24).fill(0);

        for (let h = 0; h < 24; h++) {

            const sr = hourSR[h]?.avg ?? 1;
            const basal = this.getBasalByHour(h);

            const hasCarbsOrBolus = (treatmentsByHour[h] || []).some(t =>
                (t.carbs && t.carbs > 0) ||
                (t.insulin && t.insulin > 0)
            );

            let factor = sr;

            // если есть еда/болюсы → уменьшаем влияние SR
            if (hasCarbsOrBolus) {
                factor = 1 + (sr - 1) * 0.5;
            }

            result[h] = basal * factor;
        }

        return result;
    }
}
