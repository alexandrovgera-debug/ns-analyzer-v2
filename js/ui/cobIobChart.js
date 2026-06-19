export function drawCobIobChart(data) {

    const ctx = document.getElementById("cob-iob-chart").getContext("2d");

    const deviceStatus = data.deviceStatus || [];

    const iob = [];
    const cob = [];

    for (const ds of deviceStatus) {

        const time = new Date(ds.created_at || ds.date);

        if (ds.openaps?.iob !== undefined) {
            iob.push({
                x: time,
                y: ds.openaps.iob
            });
        }

        if (ds.openaps?.cob !== undefined) {
            cob.push({
                x: time,
                y: ds.openaps.cob
            });
        }
    }

    if (window.cobIobChartInstance) {
        window.cobIobChartInstance.destroy();
    }

    window.cobIobChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "IOB",
                    data: iob,
                    borderColor: "#4dabf7",
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: "COB",
                    data: cob,
                    borderColor: "#51cf66",
                    tension: 0.3,
                    pointRadius: 0
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
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: "top"
                }
            }
        }
    });
}
