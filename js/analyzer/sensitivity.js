export default class SensitivityAnalyzer {

    constructor(profile) {
        this.profile = profile;
    }

    analyze(deviceStatus, entries, treatments, shiftMinutes = 60) {

        const HOURS = 24;

        const result = [];

        // создаём 24 часа
        for (let h = 0; h < HOURS; h++) {

            result.push({
                hour: h,
                srSum: 0,
                srCount: 0,
                srAvg: 0,
                basal: 0,
                suggestedBasal: 0,
                cleanBasal: true
            });

        }

        // индексируем entries по времени
        const entryMap = new Map();

        for (const e of entries || []) {

            const t = new Date(e.dateString || e.date || e.mills);
            const hour = t.getHours();

            if (!entryMap.has(hour)) {
                entryMap.set(hour, []);
            }

            entryMap.get(hour).push(e);

        }

        // индексируем treatments (болюсы / углеводы)
        const treatmentMap = new Map();

        for (const t of treatments || []) {

            const time = new Date(t.created_at || t.mills);
            const hour = time.getHours();

            if (!treatmentMap.has(hour)) {
                treatmentMap.set(hour, []);
            }

            treatmentMap.get(hour).push(t);
        }

        // SR из devicestatus
        for (const ds of deviceStatus || []) {

            const sr = ds?.openaps?.suggested?.sensitivityRatio;

            if (sr === undefined || sr === null) continue;

            const time = new Date(ds.created_at || ds.date);
            let hour = time.getHours();

            // фиксированный сдвиг 60 минут (Фиасп)
            const shifted = new Date(time.getTime() - shiftMinutes * 60000);
            hour = shifted.getHours();

            const bucket = result[hour];

            bucket.srSum += sr;
            bucket.srCount += 1;

        }

        // усреднение SR
        for (const r of result) {

            if (r.srCount > 0) {
                r.srAvg = r.srSum / r.srCount;
            }

        }

        // анализ базала + влияние болюсов/углеводов
        for (let h = 0; h < HOURS; h++) {

            const r = result[h];

            const treatmentsInHour = treatmentMap.get(h) || [];

            let hasBolusOrCarbs = false;

            for (const t of treatmentsInHour) {

                if (t.carbs || t.insulin) {
                    hasBolusOrCarbs = true;
                    break;
                }
            }

            const profileBasal = this.getProfileBasal(h);

            r.basal = profileBasal;

            if (!hasBolusOrCarbs) {

                // чистый базал → 100% SR
                r.suggestedBasal = profileBasal * (r.srAvg || 1);
                r.cleanBasal = true;

            } else {

                // есть вмешательство → частичное влияние SR
                const factor = 0.5 + (r.srAvg ? (r.srAvg - 1) * 0.5 : 0);

                r.suggestedBasal = profileBasal * factor;
                r.cleanBasal = false;
            }

        }

        return result;
    }

    getProfileBasal(hour) {

        const basal = this.profile?.basal || [];

        for (const b of basal) {

            const start = parseFloat(b.time);

            const next = this.getNextTime(basal, start);

            if (hour >= start && hour < next) {
                return b.value;
            }
        }

        return basal.length ? basal[0].value : 0;
    }

    getNextTime(basal, current) {

        const times = basal.map(b => parseFloat(b.time)).sort((a, b) => a - b);

        for (const t of times) {
            if (t > current) return t;
        }

        return 24;
    }
}
