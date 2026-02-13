// Constants & Chart variables
const TOTAL_SEM = 8;
let progressChart = null;
let semesterChart = null;

// Company data configuration
const companyTiers = {
    'S+': { minCGPA: 8.0, companies: [], ctc: '₹30+ LPA' },
    'A+': { minCGPA: 7.5, companies: [], ctc: '₹20-30 LPA' },
    'A': { minCGPA: 7.5, companies: [], ctc: '₹10-20 LPA' },
    'B': { minCGPA: 7.0, companies: [], ctc: '₹5-10 LPA' },
    'C': { minCGPA: 6.0, companies: [], ctc: 'Below ₹5 LPA' }
};

const companyData = [
    // S+ Tier Companies (₹30+ LPA)
    { name: 'McKinsey & Company', tier: 'S+', cgpa: 8.0 },
    { name: 'Boston Consulting Group', tier: 'S+', cgpa: 8.0 },
    { name: 'Bain & Company', tier: 'S+', cgpa: 8.0 },
    { name: 'Goldman Sachs', tier: 'S+', cgpa: 8.0 },
    { name: 'Morgan Stanley', tier: 'S+', cgpa: 8.0 },
    { name: 'Tower Research Capital', tier: 'S+', cgpa: 8.0 },
    { name: 'Jane Street', tier: 'S+', cgpa: 8.0 },
    { name: 'Google', tier: 'S+', cgpa: 8.0 },
    { name: 'Facebook', tier: 'S+', cgpa: 8.0 },
    { name: 'Apple', tier: 'S+', cgpa: 8.0 },
    { name: 'Microsoft', tier: 'S+', cgpa: 7.5 },
    { name: 'Amazon (for select roles)', tier: 'S+', cgpa: 7.5 },
    { name: 'Uber (for select roles)', tier: 'S+', cgpa: 7.5 },
    { name: 'DE Shaw & Co.', tier: 'S+', cgpa: 8.0 },
    { name: 'WorldQuant', tier: 'S+', cgpa: 8.0 },
    { name: 'BlackRock', tier: 'S+', cgpa: 7.5 },
    
    // A+ Tier Companies (₹20-30 LPA)
    { name: 'Adobe', tier: 'A+', cgpa: 7.5 },
    { name: 'Oracle', tier: 'A+', cgpa: 7.5 },
    { name: 'SAP Labs', tier: 'A+', cgpa: 7.5 },
    { name: 'Cisco Systems', tier: 'A+', cgpa: 7.5 },
    { name: 'Qualcomm', tier: 'A+', cgpa: 7.5 },
    { name: 'Intel', tier: 'A+', cgpa: 7.5 },
    { name: 'Samsung R&D', tier: 'A+', cgpa: 7.5 },
    { name: 'Flipkart', tier: 'A+', cgpa: 7.5 },
    { name: 'Myntra', tier: 'A+', cgpa: 7.5 },
    { name: 'Ola Cabs', tier: 'A+', cgpa: 7.5 },
    { name: 'Paytm', tier: 'A+', cgpa: 7.5 },
    { name: 'Zomato', tier: 'A+', cgpa: 7.5 },
    { name: 'Swiggy', tier: 'A+', cgpa: 7.5 },
    { name: 'Infosys (High-end)', tier: 'A+', cgpa: 7.5 },
    { name: 'Wipro (High-end)', tier: 'A+', cgpa: 7.5 },
    { name: 'TCS (Digital/Prime)', tier: 'A+', cgpa: 7.5 },
    { name: 'Reliance Industries', tier: 'A+', cgpa: 7.5 },

    // A Tier Companies (₹10-20 LPA)
    { name: 'IBM India', tier: 'A', cgpa: 7.5 },
    { name: 'HCL Technologies', tier: 'A', cgpa: 7.5 },
    { name: 'Tech Mahindra', tier: 'A', cgpa: 7.5 },
    { name: 'Cognizant', tier: 'A', cgpa: 7.5 },
    { name: 'Capgemini', tier: 'A', cgpa: 7.5 },
    { name: 'Mindtree', tier: 'A', cgpa: 7.0 },
    { name: 'L&T Infotech', tier: 'A', cgpa: 7.5 },
    
    // B Tier Companies (₹5-10 LPA)
    { name: 'Small startups', tier: 'B', cgpa: 6.0 },
    { name: 'WNS Global Services', tier: 'B', cgpa: 7.5 },
    { name: 'Genpact', tier: 'B', cgpa: 7.5 },
    { name: 'Hinduja Global Solutions', tier: 'B', cgpa: 7.5 },

    // C Tier Companies (Below ₹5 LPA)
    { name: 'Concentrix', tier: 'C', cgpa: 6.0 },
    { name: 'Sutherland Global', tier: 'C', cgpa: 6.0 },
    { name: 'Teleperformance', tier: 'C', cgpa: 6.0 },
    { name: 'TCS BPS', tier: 'C', cgpa: 6.0 },
    { name: 'Wipro BPS', tier: 'C', cgpa: 6.0 },
    { name: 'Tata Elxsi', tier: 'C', cgpa: 6.0 },
    { name: 'Robert Bosch', tier: 'C', cgpa: 6.0 }
];

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    hideAllSections();
    initializeAll();
    
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculate);
    }
    
    initializeFeedbackRipple();
});

function initializeAll() {
    initializeMobileMenu();
    initializeTooltips();
    initializeCompanyData();
}

function initializeCompanyData() {
    // Prevent duplication if re-initialized
    Object.keys(companyTiers).forEach(tier => companyTiers[tier].companies = []);
    
    companyData.forEach(company => {
        if (companyTiers[company.tier]) {
            companyTiers[company.tier].companies.push(company);
        }
    });
}

// --- Core Calculation Logic ---

function calculate() {
    hideAllSections();
    
    // Select inputs
    const currentInput = document.getElementById('currentCGPA');
    const semInput = document.getElementById('completedSem');
    const targetInput = document.getElementById('targetCGPA');

    const currentCGPA = parseFloat(currentInput.value);
    const completedSem = parseInt(semInput.value);
    const targetCGPA = parseFloat(targetInput.value);
    
    // Validate inputs
    if (!validateInputs(currentCGPA, completedSem, targetCGPA)) return;

    const remainingSem = TOTAL_SEM - completedSem;
    
    // Safety check for sem 8 graduates
    if (remainingSem <= 0) {
        showError("All semesters are already completed!");
        return;
    }

    const requiredCGPA = ((targetCGPA * TOTAL_SEM) - (currentCGPA * completedSem)) / remainingSem;
    
    // Show placement badge based on CURRENT standing
    updatePlacementBadge(currentCGPA);
    
    if (requiredCGPA > 10) {
        const maxPossible = ((currentCGPA * completedSem + 10 * remainingSem) / TOTAL_SEM).toFixed(2);
        showError(`Target not achievable. Maximum possible CGPA is ${maxPossible}`);
        return;
    }

    showResults(requiredCGPA, remainingSem, currentCGPA);
}

function validateInputs(current, sem, target) {
    if (isNaN(current) || isNaN(sem) || isNaN(target)) {
        showError('Please fill in all fields with valid numbers');
        return false;
    }
    if (current < 0 || current > 10 || target < 0 || target > 10) {
        showError('CGPA must be between 0 and 10');
        return false;
    }
    if (sem < 1 || sem >= TOTAL_SEM) {
        showError(`Completed semesters must be between 1 and ${TOTAL_SEM - 1}`);
        return false;
    }
    return true;
}

// --- UI Updates ---

function showResults(requiredCGPA, remainingSem, currentCGPA) {
    const sections = ['result', 'charts-section', 'company-eligibility'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
    
    document.getElementById('requiredCGPA').textContent = requiredCGPA.toFixed(2);
    document.getElementById('remainingSem').textContent = remainingSem;
    
    updateCharts();
    updateCompanyEligibility(currentCGPA);
}

function updateCompanyEligibility(cgpa) {
    let eligibleCount = 0;
    const tierCounts = { 'S+': 0, 'A+': 0, 'A': 0, 'B': 0, 'C': 0 };

    companyData.forEach(company => {
        if (cgpa >= company.cgpa) {
            eligibleCount++;
            tierCounts[company.tier]++;
        }
    });

    // Update Text
    document.getElementById('eligibleCount').textContent = `${eligibleCount}/${companyData.length}`;
    document.getElementById('userCGPA').textContent = cgpa.toFixed(2);
    
    // Update Progress Bar
    const percent = (eligibleCount / companyData.length) * 100;
    const bar = document.getElementById("eligibilityBar");
    if (bar) bar.style.width = percent + "%";
    
    // Update Tier Counts
    Object.keys(tierCounts).forEach(tier => {
        const id = `${tier.toLowerCase().replace('+', 'Plus')}Tier`;
        const element = document.getElementById(id);
        if (element) element.textContent = tierCounts[tier];
    });
}

function updatePlacementBadge(cgpa) {
    const badge = document.getElementById("placementStatusBadge");
    if (!badge) return;

    if (cgpa >= 9) {
        badge.textContent = "🟢 Strong Placement Position";
        badge.className = "placement-badge strong";
    } else if (cgpa >= 8) {
        badge.textContent = "🟡 Moderate Placement Position";
        badge.className = "placement-badge moderate";
    } else {
        badge.textContent = "🔴 Needs Improvement for Top Companies";
        badge.className = "placement-badge weak";
    }
}

// --- Charting ---

function updateCharts() {
    const currentCGPA = parseFloat(document.getElementById('currentCGPA').value);
    const completedSem = parseInt(document.getElementById('completedSem').value);
    const targetCGPA = parseFloat(document.getElementById('targetCGPA').value);
    const remainingSem = TOTAL_SEM - completedSem;
    const requiredCGPA = ((targetCGPA * TOTAL_SEM) - (currentCGPA * completedSem)) / remainingSem;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#fff' } } },
        scales: {
            y: { beginAtZero: true, max: 10, grid: { color: '#333' }, ticks: { color: '#fff' } },
            x: { grid: { color: '#333' }, ticks: { color: '#fff' } }
        }
    };

    // Progress Chart
    const ctxProgress = document.getElementById('progressChart');
    if (progressChart) progressChart.destroy();
    if (ctxProgress) {
        progressChart = new Chart(ctxProgress.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Current', 'Target'],
                datasets: [{
                    label: 'CGPA Progress',
                    data: [currentCGPA, targetCGPA],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
    }

    // Semester Bar Chart
    const ctxSemester = document.getElementById('semesterChart');
    if (semesterChart) semesterChart.destroy();
    if (ctxSemester) {
        const labels = Array.from({ length: remainingSem }, (_, i) => `Sem ${completedSem + i + 1}`);
        semesterChart = new Chart(ctxSemester.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Required Per Sem',
                    data: Array(remainingSem).fill(requiredCGPA),
                    backgroundColor: '#009dff'
                }]
            },
            options: chartOptions
        });
    }
}

// --- Utilities ---

function hideAllSections() {
    ['result', 'charts-section', 'company-eligibility', 'error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showError(msg) {
    const err = document.getElementById('error');
    if (err) {
        err.textContent = msg;
        err.style.display = 'block';
    }
}

function initializeMobileMenu() {
    const btn = document.querySelector('.menu-button');
    const nav = document.querySelector('.nav-links');
    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('active'));
    }
}

function initializeTooltips() {
    document.querySelectorAll('.tooltip i').forEach(tip => {
        tip.addEventListener('mouseenter', (e) => {
            const content = document.createElement('div');
            content.className = 'tooltip-content';
            content.textContent = tip.getAttribute('title');
            tip.parentNode.appendChild(content);
        });
        tip.addEventListener('mouseleave', (e) => {
            const content = tip.parentNode.querySelector('.tooltip-content');
            if (content) content.remove();
        });
    });
}

function initializeFeedbackRipple() {
    const feedbackLink = document.querySelector('.feedback-link');
    if (!feedbackLink) return;

    feedbackLink.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        ripple.style.width = ripple.style.height = '20px';
        ripple.style.left = `${e.offsetX}px`;
        ripple.style.top = `${e.offsetY}px`;
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';

        feedbackLink.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// Global ripple styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% { width: 0; height: 0; opacity: 0.5; }
        100% { width: 150px; height: 150px; opacity: 0; }
    }
`;
document.head.appendChild(style);
