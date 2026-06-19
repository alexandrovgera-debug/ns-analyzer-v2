export function drawGlucoseChart(data) {

    const ctx = document.getElementById("glucose-chart").getContext("2d");

    const entries = data.entries || [];
    const treatments = data.treatments || [];

    const glucosePoints = entries.map(e => ({
        x: new Date(e.dateString || e.date || e.mills),
        y: e.sgv || e.glucose
    })).filter(p => p.y != null);

    const carbs = treatments
        .filter(t => t.carbs)
        .map(t => ({
            x: new Date(t.created_at),
            y: null,
            label: `🍞 ${t.carbs}`
        }));

    const insulin = treatments
        .filter(t => t.insulin)
        .map(t => ({
            x: new Date(t.created_at),
            y: null,
            label: `💉 ${t.insulin}`
        }));

    if (window.glucoseChartInstance) {
        window.glucoseChartInstance.destroy();
    }

    window.glucoseChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Глюкоза",
                    data: glucosePoints,
                    borderColor: "#ff4d4f",
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: "Углеводы",
                    data: carbs,
                    showLine: false,
                    pointRadius: 6
                },
                {
                    label: "Инсулин",
                    data: insulin,
                    showLine: false,
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "time"
                },
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            if (ctx.raw.label) return ctx.raw.label;
                            return ctx.parsed.y;
                        }
                    }
                }
            }
        }
    });
}
