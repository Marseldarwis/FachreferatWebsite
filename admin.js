// HIER HINTERLEGEN: Die GLEICHE URL wie in script.js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfD09dLRzCjzc8EPUCXbSSi113ln56pgmhhIOFSZDhE8EeNeSFzL18RRjgvXMIHyVbtA/exec';
const PASSWORD = 'admin'; // Einfaches Passwort

let surveyData = [];

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    if (input === PASSWORD) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        loadData();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

async function loadData() {


    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();

        if (result.status === 'success') {
            surveyData = result.data;
            renderCharts();
            renderTextAnswers();
        } else {
            alert('Keine Daten gefunden oder Fehler beim Laden.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Fehler beim Verbinden zur Datenbank.');
    }
}

function processDataForChart(key) {
    // Counts occurrences of each value for a specific question (key)
    const counts = {};
    surveyData.forEach(entry => {
        const val = entry[key];
        if (val) {
            counts[val] = (counts[val] || 0) + 1;
        }
    });
    return counts;
}

function renderCharts() {
    // 1. Alter (q1)
    const ageData = processDataForChart('q1');
    createChart('chartAge', 'Alter', ageData, ['#FF6384', '#36A2EB', '#FFCE56']);

    // 2. Motivation (q2) - NEW Horizontal Bar
    const motData = processDataForChart('q2');
    // Ensure A, B, C, D are present even if 0? processDataForChart only counts present ones.
    // Ideally we'd merge with default {A:0, B:0, C:0, D:0} but simplest is just render what we have.
    createHorizontalBarChart('chartMotivation', 'Motivation Autonomes Fahren', motData, ['#4299E1', '#48BB78', '#ED8936', '#F56565']);

    // 2. Zufriedenheit (q3)
    const satData = processDataForChart('q3');
    createChart('chartSatisfaction', 'Zufriedenheit', satData, ['#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED']);

    // 3. Lieblingsfach (q5)
    const subjData = processDataForChart('q5');
    createChart('chartSubjects', 'Fächer', subjData, ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB']);

    // 4. Pausenzeiten (q6)
    const breakData = processDataForChart('q6');
    createChart('chartBreaks', 'Pause', breakData, ['#FF9F40', '#36A2EB', '#9966FF']);

    // 5. Video Wahl (q11) - NEW
    const videoData = processDataForChart('q11');
    createChart('chartVideo', 'Video Wahl', videoData, ['#F6E05E', '#B794F4', '#FC8181']);
}

function createChart(canvasId, label, dataObj, colors) {
    const element = document.getElementById(canvasId);
    if (!element) return; // Safety check
    const ctx = element.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut', // or 'bar', 'pie'
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: label,
                data: Object.values(dataObj),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderTextAnswers() {
    const container = document.getElementById('textAnswersContainer');
    container.innerHTML = '';

    // Show last 10 answers for Q12 (AG Wünsche) - Q11 is now Video Choice
    const reversed = [...surveyData].reverse().slice(0, 10);

    reversed.forEach(entry => {
        if (entry.q12) {
            const div = document.createElement('div');
            div.className = 'answer-item';
            div.textContent = entry.q12;
            container.appendChild(div);
        }
    });

    if (reversed.length === 0) {
        container.innerHTML = '<i>Keine Antworten vorhanden.</i>';
    }
}

async function resetData() {
    if (!confirm('Sind Sie sicher? Alle Daten werden unwiderruflich gelöscht!')) return;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'reset' })
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Daten wurden zurückgesetzt.');
            location.reload();
        } else {
            alert('Fehler beim Zurücksetzen: ' + result.message);
        }
    } catch (error) {
        console.error('Error resetting data:', error);
        alert('Netzwerkfehler beim Zurücksetzen.');
    }
}

function createHorizontalBarChart(canvasId, label, dataObj, colors) {
    const element = document.getElementById(canvasId);
    if (!element) return;
    const ctx = element.getContext('2d');

    // Sort keys A, B, C, D if present? Object.keys usually keeps order but let's be safe or just standard
    // If we want fixed labels A, B, C, D we need to merge data.
    // For now simple:
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: label,
                data: Object.values(dataObj),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}
