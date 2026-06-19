import NightscoutAPI from "./api.js";
import profile from "./profile.js";
import Analyzer from "./analyzer/index.js";

import { renderTables } from "./ui/tables.js";
import { drawGlucoseChart } from "./ui/glucoseChart.js";
import { drawCobIobChart } from "./ui/cobIobChart.js";

const button = document.getElementById("analyze");

button.addEventListener("click", analyze);

async function analyze() {

    button.disabled = true;
    button.textContent = "Загрузка...";

    try {

        const url = document.getElementById("url").value.trim();

        const api = new NightscoutAPI(url);

        const selectedDate = new Date(); // пока всегда сегодня

        const data = await api.loadDay(selectedDate);

        const analyzer = new Analyzer(data.profile);

        const result = analyzer.analyze({
            deviceStatus: data.deviceStatus,
            entries: data.entries,
            treatments: data.treatments,
            shiftMinutes: 60
        });

        renderTables(result);

        drawGlucoseChart({
            entries: data.entries,
            treatments: data.treatments
        });

        drawCobIobChart({
            deviceStatus: data.deviceStatus
        });

    } catch (e) {

        console.error(e);
        alert("Ошибка:\n\n" + e.message);

    } finally {

        button.disabled = false;
        button.textContent = "Анализ";
    }
}

window.onload = analyze;
