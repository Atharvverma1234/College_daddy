/**
 * CGPA Performance Tracker - College Daddy
 * ==========================================
 * Allows students to input semester-wise SGPA manually,
 * then generates CGPA + performance graphs dynamically.
 * 
 * Features:
 * - 8-semester SGPA input (0–10 scale)
 * - Line graph: SGPA + cumulative CGPA with hover tooltips
 * - Bar chart: Semester comparison (color-coded best/worst)
 * - Summary stats: Highest, Lowest, Current CGPA, Trend
 * - localStorage persistence
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'cd_cgpa_tracker';
    const TOTAL_SEMESTERS = 8;

    // --- Color palette (blue theme) ---
    const COLORS = {
        sgpaLine: '#1d4ed8',       // deep royal blue
        sgpaFill: 'rgba(29, 78, 216, 0.15)',
        sgpaPoint: '#2563eb',
        cgpaLine: '#7dd3fc',       // light sky blue
        cgpaFill: 'rgba(125, 211, 252, 0.08)',
        cgpaPoint: '#7dd3fc',
        barDefault: '#3b82f6',
        barBest: '#34d399',
        barWorst: '#f87171',
        gridLine: 'rgba(148, 163, 184, 0.1)',
        axisText: '#64748b',
        pointHover: '#ffffff'
    };

    // --- State ---
    let sgpaData = new Array(TOTAL_SEMESTERS).fill(null);

    // --- DOM Elements ---
    const sgpaGrid = document.getElementById('sgpaGrid');
    const btnSave = document.getElementById('btnSave');
    const btnClear = document.getElementById('btnClear');
    const graphSection = document.getElementById('graphSection');
    const statsSection = document.getElementById('statsSection');
    const barSection = document.getElementById('barSection');
    const perfCanvas = document.getElementById('performanceChart');
    const barCanvas = document.getElementById('barChart');
    const tooltipEl = document.getElementById('chartTooltip');

    // --- Initialization ---
    function init() {
        loadFromStorage();
        renderInputGrid();
        updateVisualizations();
        attachEvents();
        createToast();
    }

    // --- Render semester input cards ---
    function renderInputGrid() {
        sgpaGrid.innerHTML = '';
        for (let i = 0; i < TOTAL_SEMESTERS; i++) {
            const card = document.createElement('div');
            card.className = 'sgpa-input-card' + (sgpaData[i] !== null ? ' has-value' : '');

            const label = document.createElement('label');
            label.className = 'sgpa-label';
            label.textContent = `Semester ${i + 1}`;
            label.setAttribute('for', `sgpa-${i}`);

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `sgpa-${i}`;
            input.className = 'sgpa-input';
            input.placeholder = '0.00';
            input.min = '0';
            input.max = '10';
            input.step = '0.01';
            input.setAttribute('aria-label', `SGPA for Semester ${i + 1}`);
            if (sgpaData[i] !== null) {
                input.value = sgpaData[i];
            }

            input.addEventListener('input', () => handleInput(i, input, card));
            input.addEventListener('blur', () => handleBlur(i, input, card));

            card.appendChild(label);
            card.appendChild(input);
            sgpaGrid.appendChild(card);
        }
    }

    // --- Input handlers ---
    function handleInput(index, input, card) {
        input.classList.remove('invalid');
        const raw = input.value.trim();
        if (raw === '') {
            sgpaData[index] = null;
            card.classList.remove('has-value');
        } else {
            const val = parseFloat(raw);
            if (!isNaN(val) && val >= 0 && val <= 10) {
                sgpaData[index] = Math.round(val * 100) / 100;
                card.classList.add('has-value');
            }
        }
        updateVisualizations();
    }

    function handleBlur(index, input, card) {
        const raw = input.value.trim();
        if (raw === '') {
            sgpaData[index] = null;
            card.classList.remove('has-value');
            input.classList.remove('invalid');
            return;
        }
        const val = parseFloat(raw);
        if (isNaN(val) || val < 0 || val > 10) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
            sgpaData[index] = Math.round(val * 100) / 100;
            input.value = sgpaData[index];
            card.classList.add('has-value');
        }
        updateVisualizations();
    }

    // --- Compute cumulative CGPA array ---
    function computeCGPA() {
        const cgpa = [];
        let sum = 0, count = 0;
        for (let i = 0; i < TOTAL_SEMESTERS; i++) {
            if (sgpaData[i] !== null) {
                sum += sgpaData[i];
                count++;
                cgpa.push(Math.round((sum / count) * 100) / 100);
            } else {
                cgpa.push(null);
            }
        }
        return cgpa;
    }

    // --- Get filled entries ---
    function getFilledEntries() {
        const entries = [];
        for (let i = 0; i < TOTAL_SEMESTERS; i++) {
            if (sgpaData[i] !== null) {
                entries.push({ semester: i, sgpa: sgpaData[i] });
            }
        }
        return entries;
    }

    // --- Update all visualizations ---
    function updateVisualizations() {
        const filled = getFilledEntries();
        const show = filled.length >= 1;

        graphSection.style.display = show ? 'block' : 'none';
        statsSection.style.display = show ? 'block' : 'none';
        barSection.style.display = filled.length >= 2 ? 'block' : 'none';

        if (show) {
            drawLineChart();
            updateStats(filled);
            if (filled.length >= 2) drawBarChart(filled);
        }
    }

    // --- LINE CHART with hover tooltips ---
    function drawLineChart() {
        const canvas = perfCanvas;
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width - 32; // padding
        const h = parseInt(getComputedStyle(canvas).height) || 320;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const padding = { top: 20, right: 20, bottom: 40, left: 45 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const cgpa = computeCGPA();
        const filledIndices = [];
        for (let i = 0; i < TOTAL_SEMESTERS; i++) {
            if (sgpaData[i] !== null) filledIndices.push(i);
        }

        if (filledIndices.length === 0) return;

        // X positions for all 8 semesters
        const xStep = chartW / (TOTAL_SEMESTERS - 1);
        const getX = (i) => padding.left + i * xStep;
        const getY = (val) => padding.top + chartH - (val / 10) * chartH;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Grid lines (Y axis: 0, 2, 4, 6, 8, 10)
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (let v = 0; v <= 10; v += 2) {
            const y = getY(v);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Y axis labels
        ctx.fillStyle = COLORS.axisText;
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let v = 0; v <= 10; v += 2) {
            ctx.fillText(v.toString(), padding.left - 8, getY(v));
        }

        // X axis labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i < TOTAL_SEMESTERS; i++) {
            ctx.fillStyle = sgpaData[i] !== null ? COLORS.sgpaLine : COLORS.axisText;
            ctx.fillText(`S${i + 1}`, getX(i), h - padding.bottom + 10);
        }

        // Helper: draw line and area fill for filled data points
        function drawLineSeries(data, lineColor, fillColor, opts) {
            opts = opts || {};
            const lineWidth = opts.lineWidth || 2.5;
            const dash = opts.dash || [];
            const pointRadius = opts.pointRadius || 5;
            const innerRadius = opts.innerRadius || 2.5;

            const points = [];
            for (let i = 0; i < TOTAL_SEMESTERS; i++) {
                if (data[i] !== null) {
                    points.push({ x: getX(i), y: getY(data[i]) });
                }
            }
            if (points.length < 1) return;

            // Area fill
            if (points.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, getY(0));
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.lineTo(points[points.length - 1].x, getY(0));
                ctx.closePath();
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            // Line
            if (points.length >= 2) {
                ctx.beginPath();
                ctx.setLineDash(dash);
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineWidth;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Data points
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
                ctx.fillStyle = lineColor;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y, innerRadius, 0, Math.PI * 2);
                ctx.fillStyle = COLORS.pointHover;
                ctx.fill();
            });
        }

        // Draw CGPA first (behind), then SGPA on top
        drawLineSeries(cgpa, COLORS.cgpaLine, COLORS.cgpaFill, {
            lineWidth: 2, dash: [6, 4], pointRadius: 4.5, innerRadius: 2
        });
        drawLineSeries(sgpaData, COLORS.sgpaLine, COLORS.sgpaFill, {
            lineWidth: 3, dash: [], pointRadius: 5.5, innerRadius: 2.5
        });

        // --- Hover tooltip logic ---
        // Store point data for hover detection
        canvas._chartMeta = {
            getX, getY, padding, sgpaData: [...sgpaData], cgpa: [...cgpa], w, h, dpr
        };
    }

    // --- Tooltip handler for line chart ---
    function setupLineChartTooltip() {
        const canvas = perfCanvas;
        const container = canvas.parentElement;

        canvas.addEventListener('mousemove', function (e) {
            const meta = canvas._chartMeta;
            if (!meta) return;

            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            let closest = null;
            let minDist = Infinity;

            for (let i = 0; i < TOTAL_SEMESTERS; i++) {
                if (meta.sgpaData[i] === null) continue;
                const px = meta.getX(i);
                const py = meta.getY(meta.sgpaData[i]);
                const dist = Math.abs(mx - px);
                if (dist < minDist && dist < 40) {
                    minDist = dist;
                    closest = i;
                }
            }

            if (closest !== null) {
                const sgpa = meta.sgpaData[closest];
                const cgpa = meta.cgpa[closest];
                const px = meta.getX(closest);

                tooltipEl.innerHTML = `
                    <div class="tooltip-title">Semester ${closest + 1}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">SGPA</span>
                        <span class="tooltip-value sgpa-color">${sgpa.toFixed(2)}</span>
                    </div>
                    ${cgpa !== null ? `
                    <div class="tooltip-row">
                        <span class="tooltip-label">CGPA</span>
                        <span class="tooltip-value cgpa-color">${cgpa.toFixed(2)}</span>
                    </div>` : ''}
                `;
                tooltipEl.classList.add('visible');

                // Position tooltip relative to chart container
                const containerRect = container.getBoundingClientRect();
                let tipX = e.clientX - containerRect.left + 14;
                let tipY = e.clientY - containerRect.top - 10;

                // Keep tooltip in bounds
                const tipW = tooltipEl.offsetWidth;
                if (tipX + tipW > containerRect.width - 10) {
                    tipX = e.clientX - containerRect.left - tipW - 14;
                }

                tooltipEl.style.left = tipX + 'px';
                tooltipEl.style.top = tipY + 'px';
            } else {
                tooltipEl.classList.remove('visible');
            }
        });

        canvas.addEventListener('mouseleave', function () {
            tooltipEl.classList.remove('visible');
        });
    }

    // --- BAR CHART ---
    function drawBarChart(filled) {
        const canvas = barCanvas;
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width - 32;
        const h = parseInt(getComputedStyle(canvas).height) || 260;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const padding = { top: 15, right: 15, bottom: 40, left: 40 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const count = filled.length;
        const barGap = Math.min(20, chartW / count * 0.25);
        const barW = Math.min(50, (chartW - barGap * (count + 1)) / count);
        const totalBarsW = count * barW + (count - 1) * barGap;
        const startX = padding.left + (chartW - totalBarsW) / 2;

        const maxSgpa = Math.max(...filled.map(e => e.sgpa));
        const minSgpa = Math.min(...filled.map(e => e.sgpa));

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (let v = 0; v <= 10; v += 2) {
            const y = padding.top + chartH - (v / 10) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Y labels
        ctx.fillStyle = COLORS.axisText;
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let v = 0; v <= 10; v += 2) {
            const y = padding.top + chartH - (v / 10) * chartH;
            ctx.fillText(v.toString(), padding.left - 8, y);
        }

        // Bars
        filled.forEach((entry, idx) => {
            const x = startX + idx * (barW + barGap);
            const barH = (entry.sgpa / 10) * chartH;
            const y = padding.top + chartH - barH;

            let color = COLORS.barDefault;
            if (count > 1 && entry.sgpa === maxSgpa) color = COLORS.barBest;
            if (count > 1 && entry.sgpa === minSgpa && maxSgpa !== minSgpa) color = COLORS.barWorst;

            // Bar with rounded top
            const radius = Math.min(5, barW / 2);
            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.arcTo(x + barW, y, x + barW, y + radius, radius);
            ctx.lineTo(x + barW, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Value on top
            ctx.fillStyle = COLORS.axisText;
            ctx.font = 'bold 11px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(entry.sgpa.toFixed(1), x + barW / 2, y - 4);

            // Semester label
            ctx.fillStyle = COLORS.axisText;
            ctx.font = '11px -apple-system, sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(`S${entry.semester + 1}`, x + barW / 2, padding.top + chartH + 8);
        });
    }

    // --- Update stats ---
    function updateStats(filled) {
        if (filled.length === 0) return;

        const sgpas = filled.map(e => e.sgpa);
        const maxVal = Math.max(...sgpas);
        const minVal = Math.min(...sgpas);
        const maxEntry = filled.find(e => e.sgpa === maxVal);
        const minEntry = filled.find(e => e.sgpa === minVal);

        const cgpa = computeCGPA();
        let latestCGPA = null;
        for (let i = TOTAL_SEMESTERS - 1; i >= 0; i--) {
            if (cgpa[i] !== null) { latestCGPA = cgpa[i]; break; }
        }

        document.getElementById('statHighest').textContent = maxVal.toFixed(2);
        document.getElementById('statHighestSem').textContent = `Semester ${maxEntry.semester + 1}`;

        document.getElementById('statLowest').textContent = minVal.toFixed(2);
        document.getElementById('statLowestSem').textContent = `Semester ${minEntry.semester + 1}`;

        document.getElementById('statCGPA').textContent = latestCGPA !== null ? latestCGPA.toFixed(2) : '—';
        document.getElementById('statCGPASub').textContent = `Across ${filled.length} semester${filled.length > 1 ? 's' : ''}`;

        // Trend
        if (filled.length >= 2) {
            const last = filled[filled.length - 1].sgpa;
            const prev = filled[filled.length - 2].sgpa;
            const diff = last - prev;
            const trendEl = document.getElementById('statTrend');
            const trendSub = document.getElementById('statTrendSub');

            if (diff > 0) {
                trendEl.textContent = `↑ +${diff.toFixed(2)}`;
                trendEl.style.color = '#34d399';
                trendSub.textContent = 'Improving';
            } else if (diff < 0) {
                trendEl.textContent = `↓ ${diff.toFixed(2)}`;
                trendEl.style.color = '#f87171';
                trendSub.textContent = 'Declining';
            } else {
                trendEl.textContent = '→ 0.00';
                trendEl.style.color = '#fbbf24';
                trendSub.textContent = 'Stable';
            }
        } else {
            document.getElementById('statTrend').textContent = '—';
            document.getElementById('statTrend').style.color = '';
            document.getElementById('statTrendSub').textContent = 'Need 2+ semesters';
        }
    }

    // --- Storage ---
    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sgpaData));
            showToast('Progress saved!');
        } catch (e) {
            showToast('Could not save data');
        }
    }

    function loadFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === TOTAL_SEMESTERS) {
                    sgpaData = parsed;
                }
            }
        } catch (e) {
            // Ignore corrupted data
        }
    }

    function clearData() {
        if (!confirm('Clear all semester data? This cannot be undone.')) return;
        sgpaData = new Array(TOTAL_SEMESTERS).fill(null);
        localStorage.removeItem(STORAGE_KEY);
        renderInputGrid();
        updateVisualizations();
        showToast('Data cleared');
    }

    // --- Toast ---
    let toastEl;
    let toastTimeout;

    function createToast() {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
    }

    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2200);
    }

    // --- Events ---
    function attachEvents() {
        btnSave.addEventListener('click', saveToStorage);
        btnClear.addEventListener('click', clearData);
        setupLineChartTooltip();

        // Redraw on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateVisualizations, 150);
        });
    }

    // --- Boot ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();