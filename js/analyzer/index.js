import SensitivityAnalyzer from "./sensitivity.js";
import BasalAnalyzer from "./basal.js";
import ISFAnalyzer from "./isf.js";
import CRAnalyzer from "./cr.js";

export default class Analyzer {

    constructor(profile) {

        this.profile = profile;

        this.sr = new SensitivityAnalyzer(profile);
        this.basal = new BasalAnalyzer(profile);
        this.isf = new ISFAnalyzer(profile);
        this.cr = new CRAnalyzer(profile);

    }

    analyze({ deviceStatus, entries, treatments, shiftMinutes = 60 }) {

        // 1. собрать SR по часам
        const srRows = this.extractSR(deviceStatus, shiftMinutes);

        // 2. treatments по часам
        const treatmentsByHour = this.groupTreatments(treatments);

        // 3. базал
        const basal = this.basal.calculateSuggestedBasal(
            this.buildHourlySR(srRows),
            treatmentsByHour
        );

        // 4. ISF
        const isfIntervals = this.isf.buildIntervalSR(srRows);
        const isf = this.isf.calculateISF(isfIntervals);

        // 5. CR
        const crIntervals = this.cr.buildIntervalSR(srRows);
        const cr = this.cr.calculateCR(crIntervals);

        return {
            srRows,
            basal,
            isf,
            cr
        };
    }

    extractSR(deviceStatus, shiftMinutes) {

        const result = [];

        for (const ds of deviceStatus || []) {

            const sr = ds?.openaps?.suggested?.sensitivityRatio;

            if (sr === undefined || sr === null) continue;

            const time = new Date(ds.created_at || ds.date);

            // 60 минут сдвиг (Фиасп)
            const shifted = new Date(time.getTime() - shiftMinutes * 60000);

            result.push({
                time: shifted,
                sr
            });
        }

        return result;
    }

    buildHourlySR(srRows) {

        const hours = Array.from({ length: 24 }, () => ({
            sum: 0,
            count: 0,
            avg: 1
        }));

        for (const r of srRows) {

            const h = r.time.getHours();

            hours[h].sum += r.sr;
            hours[h].count += 1;

        }

        for (const h of hours) {

            if (h.count > 0) {
                h.avg = h.sum / h.count;
            }

        }

        return hours;
    }

    groupTreatments(treatments) {

        const hours = Array.from({ length: 24 }, () => []);

        for (const t of treatments || []) {

            const time = new Date(t.created_at || t.mills);
            const h = time.getHours();

            hours[h].push(t);
        }

        return hours;
    }
}
