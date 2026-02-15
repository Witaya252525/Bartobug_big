
// Bucks2Bar: live-updating Income vs Expense chart (Jan-Dec)
// Requirements: numeric-only, no negatives, debounced live updates, no persistence.

(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartCanvasId = 'incomeExpenseChart';
    const monthlyInputsContainerId = 'monthly-inputs';
    const updateBtnId = 'update-chart';

    let chart = null;
    const DEBOUNCE_MS = 300;

    // Utilities
    function qs(selector, root = document) { return root.querySelector(selector); }
    function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
    function el(tag, attrs = {}, children = []) {
        const e = document.createElement(tag);
        Object.entries(attrs).forEach(([k,v]) => {
            if (k === 'class') e.className = v;
            else if (k.startsWith('data-')) e.setAttribute(k, v);
            else e[k] = v;
        });
        (Array.isArray(children) ? children : [children]).forEach(child => {
            if (!child) return;
            if (typeof child === 'string') e.appendChild(document.createTextNode(child));
            else e.appendChild(child);
        });
        return e;
    }

    // Debounce
    function debounce(fn, wait) {
        let t = null;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    }

    // Render inputs for 12 months
    function renderDataInputs() {
        const container = qs(`#${monthlyInputsContainerId}`);
        container.innerHTML = '';

        months.forEach((m, idx) => {
            const i = String(idx + 1).padStart(2,'0');
            const row = el('div', { class: 'd-flex month-row mb-2' });

            const labelCol = el('div', { class: 'me-3 d-flex align-items-center' },
                el('strong', {}, `${m}`)
            );

            const incomeCol = el('div', { class: 'input-col me-2' });
            const incomeInput = el('input', {
                type: 'number',
                class: 'form-control income-input',
                id: `income-${i}`,
                name: `income-${i}`,
                min: '0',
                step: '0.01',
                inputMode: 'numeric',
                placeholder: 'Income'
            });
            const incomeFeedback = el('div', { class: 'invalid-feedback' }, 'Enter a non-negative number');
            incomeCol.appendChild(incomeInput);
            incomeCol.appendChild(incomeFeedback);

            const expenseCol = el('div', { class: 'input-col me-2' });
            const expenseInput = el('input', {
                type: 'number',
                class: 'form-control expense-input',
                id: `expense-${i}`,
                name: `expense-${i}`,
                min: '0',
                step: '0.01',
                inputMode: 'numeric',
                placeholder: 'Expense'
            });
            const expenseFeedback = el('div', { class: 'invalid-feedback' }, 'Enter a non-negative number');
            expenseCol.appendChild(expenseInput);
            expenseCol.appendChild(expenseFeedback);

            row.appendChild(labelCol);
            row.appendChild(incomeCol);
            row.appendChild(expenseCol);

            // Prevent minus sign entry on keydown
            [incomeInput, expenseInput].forEach(inp => {
                inp.addEventListener('keydown', (ev) => {
                    if (ev.key === '-' || ev.key === 'e' || ev.key === 'E') {
                        // block minus and exponential to avoid strange numeric entries
                        ev.preventDefault();
                    }
                });
            });

            container.appendChild(row);
        });
    }

    // Validate inputs: returns true if all valid (numeric and >=0)
    function validateInputs() {
        let valid = true;
        const inputs = qsa(`#${monthlyInputsContainerId} input[type="number"]`);
        inputs.forEach(inp => {
            const raw = inp.value;
            const val = raw === '' ? NaN : Number(raw);
            if (Number.isFinite(val) && val >= 0) {
                inp.classList.remove('is-invalid');
            } else {
                inp.classList.add('is-invalid');
                valid = false;
            }
        });

        const alert = qs('#form-alert');
        if (!valid) {
            if (alert) {
                alert.classList.remove('d-none');
                alert.textContent = 'Please fix invalid inputs (must be non-negative numbers).';
            }
        } else {
            if (alert) {
                alert.classList.add('d-none');
                alert.textContent = '';
            }
        }
        return valid;
    }

    // Read inputs and return data object with clamped non-negative numbers
    function getMonthlyData() {
        const incomes = [];
        const expenses = [];

        months.forEach((_, idx) => {
            const i = String(idx + 1).padStart(2,'0');
            const incEl = qs(`#income-${i}`);
            const expEl = qs(`#expense-${i}`);
            let inc = incEl && incEl.value !== '' ? parseFloat(incEl.value) : 0;
            let exp = expEl && expEl.value !== '' ? parseFloat(expEl.value) : 0;
            if (!Number.isFinite(inc) || inc < 0) inc = 0;
            if (!Number.isFinite(exp) || exp < 0) exp = 0;
            incomes.push(+inc.toFixed(2));
            expenses.push(+exp.toFixed(2));
        });

        return { months: months.slice(), incomes, expenses };
    }

    // Create Chart.js grouped bar chart
    function createChart(initialData) {
        const ctx = qs(`#${chartCanvasId}`).getContext('2d');
        const cfg = {
            type: 'bar',
            data: {
                labels: initialData.months,
                datasets: [
                    {
                        label: 'Income',
                        data: initialData.incomes,
                        backgroundColor: 'rgba(40,167,69,0.8)', // green
                        borderColor: 'rgba(40,167,69,1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expense',
                        data: initialData.expenses,
                        backgroundColor: 'rgba(220,53,69,0.85)', // red
                        borderColor: 'rgba(220,53,69,1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                stacked: false,
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: true }
                }
            }
        };

        if (chart) {
            chart.destroy();
            chart = null;
        }
        chart = new Chart(ctx, cfg);
    }

    // Update chart data (create if missing)
    function updateChart(data) {
        if (!chart) {
            createChart(data);
            return;
        }
        chart.data.labels = data.months;
        chart.data.datasets[0].data = data.incomes;
        chart.data.datasets[1].data = data.expenses;
        chart.update();
    }

    // Live update handler (debounced)
    const liveUpdateHandler = debounce(() => {
        const valid = validateInputs();
        if (!valid) {
            // still update with clamped zeros for visibility if desired:
            const data = getMonthlyData();
            updateChart(data);
            return;
        }
        const data = getMonthlyData();
        updateChart(data);
    }, DEBOUNCE_MS);

    function attachLiveListeners() {
        const inputs = qsa(`#${monthlyInputsContainerId} input[type="number"]`);
        inputs.forEach(inp => {
            inp.addEventListener('input', liveUpdateHandler);
            // also blur to validate immediately
            inp.addEventListener('blur', () => {
                validateInputs();
            });
        });
    }

    // Tabs: accessible show/hide
    function initTabs() {
        const btnData = qs('#tab-btn-data');
        const btnChart = qs('#tab-btn-chart');
        const panelData = qs('#tab-data');
        const panelChart = qs('#tab-chart');

        function showDataTab() {
            btnData.setAttribute('aria-selected','true');
            btnChart.setAttribute('aria-selected','false');
            panelData.hidden = false;
            panelChart.hidden = true;
            btnData.classList.add('btn-primary');
            btnData.classList.remove('btn-outline-primary');
            btnChart.classList.remove('btn-primary');
            btnChart.classList.add('btn-outline-primary');
        }

        function showChartTab() {
            btnData.setAttribute('aria-selected','false');
            btnChart.setAttribute('aria-selected','true');
            panelData.hidden = true;
            panelChart.hidden = false;
            btnChart.classList.add('btn-primary');
            btnChart.classList.remove('btn-outline-primary');
            btnData.classList.remove('btn-primary');
            btnData.classList.add('btn-outline-primary');
            // ensure chart is created/updated with current data
            const data = getMonthlyData();
            updateChart(data);
        }

        btnData.addEventListener('click', () => showDataTab());
        btnChart.addEventListener('click', () => showChartTab());

        // Keyboard navigation (left/right)
        [btnData, btnChart].forEach(btn => {
            btn.addEventListener('keydown', (ev) => {
                if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
                    ev.preventDefault();
                    if (document.activeElement === btnData) {
                        btnChart.focus();
                    } else {
                        btnData.focus();
                    }
                }
            });
        });

        // default: show data
        showDataTab();
    }

    // Wire update button (manual)
    function wireUpdateButton() {
        const updateBtn = qs(`#${updateBtnId}`);
        if (!updateBtn) return;
        updateBtn.addEventListener('click', () => {
            const valid = validateInputs();
            const data = getMonthlyData();
            if (!valid) {
                // Highlight errors but still show chart with clamped values
                updateChart(data);
                return;
            }
            updateChart(data);
            // switch to chart tab for visibility
            qs('#tab-btn-chart').click();
        });
    }

    // Initialize everything on load
    window.addEventListener('load', () => {
        renderDataInputs();
        initTabs();
        attachLiveListeners();
        wireUpdateButton();

        // initial chart with zeros from inputs
        const initialData = getMonthlyData();
        createChart(initialData);
    });
})();

