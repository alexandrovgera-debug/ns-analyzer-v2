export function renderTables(result) {

    const { basal, isf, cr } = result;

    renderBasalTable(basal);
    renderISFTable(isf);
    renderCRTable(cr);

}

function renderBasalTable(basal) {

    const el = document.getElementById("basal-table");

    let html = `
        <tr>
            <th>Час</th>
            <th>SR</th>
            <th>Базал</th>
            <th>Рекомендуемый</th>
        </tr>
    `;

    for (let h = 0; h < 24; h++) {

        const row = basal[h];

        const highlight = row.cleanBasal ? 'style="background:#f3faf3"' : '';

        html += `
            <tr ${highlight}>
                <td>${h}:00</td>
                <td>${row.srAvg?.toFixed(2) ?? 1}</td>
                <td>${row.basal?.toFixed(2) ?? 0}</td>
                <td>${row.suggestedBasal?.toFixed(2) ?? 0}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}

function renderISFTable(isf) {

    const el = document.getElementById("isf-table");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>ISF</th>
            <th>Рекомендуемый</th>
        </tr>
    `;

    for (const r of isf) {

        html += `
            <tr>
                <td>${r.start.toFixed(1)} - ${r.end.toFixed(1)}</td>
                <td>${r.srAvg.toFixed(2)}</td>
                <td>${r.currentISF.toFixed(2)}</td>
                <td>${r.suggestedISF.toFixed(2)}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}

function renderCRTable(cr) {

    const el = document.getElementById("cr-table");

    let html = `
        <tr>
            <th>Интервал</th>
            <th>SR</th>
            <th>CR</th>
            <th>Рекомендуемый</th>
        </tr>
    `;

    for (const r of cr) {

        html += `
            <tr>
                <td>${r.start.toFixed(1)} - ${r.end.toFixed(1)}</td>
                <td>${r.srAvg.toFixed(2)}</td>
                <td>${r.currentCR.toFixed(2)}</td>
                <td>${r.suggestedCR.toFixed(2)}</td>
            </tr>
        `;
    }

    el.innerHTML = html;
}
