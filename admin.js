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

function processDataForChart(key, possibleValues = []) {
    // Counts occurrences of each value for a specific question (key)
    const counts = {};
    if (possibleValues) {
        possibleValues.forEach(val => counts[val] = 0);
    }

    surveyData.forEach(entry => {
        const val = entry[key];
        if (val) {
            // Split by comma for multiple choice support (e.g. "A, B")
            const parts = val.toString().split(',').map(s => s.trim());
            parts.forEach(part => {
                if (part) {
                    // Make sure we count it even if not in possibleValues (unless we want to filter?)
                    // Usually better to count everything to see errors, but for Q2 we want A,B,C,D
                    counts[part] = (counts[part] || 0) + 1;
                }
            });
        }
    });
    return counts;
}

function renderCharts() {
    // 1. Trolley Problem (q1 - previously Age)
    const trolleyData = processDataForChart('q1');
    // Using 3 colors for A, B, C
    createChart('chartAge', 'Entscheidung', trolleyData, ['#F6E05E', '#63B3ED', '#F56565']);

    // 2. Motivation (q2) - NEW Horizontal Bar
    // Force A, B, C, D to be present
    const motData = processDataForChart('q2', ['A', 'B', 'C', 'D']);
    createHorizontalBarChart('chartMotivation', 'Motivation Autonomes Fahren', motData, ['#4299E1', '#48BB78', '#ED8936', '#F56565']);

    // 3. Sensor-Wissen (q3) - NEW Quiz
    const sensorScores = calculateSensorQuizScores();
    createBarChart('chartSensors', 'Richtige Antworten (%)', sensorScores, '#805AD5');

    // 4. Sensor Kombination (q4) - NEW Logic
    // Nein is Correct (Green), Ja is Wrong (Red)
    const combData = processDataForChart('q4');
    // Ensure colors map to Ja/Nein if keys are consistent.
    // If keys are arbitrary order, we might need manual mapping or helper.
    // Assuming keys "Ja" and "Nein". Note: "Ja" comes first alphabetically? No, "Ja" vs "Nein".
    // Better to use color array or mapped colors?
    // Let's rely on standard colors for now or strict mapping?
    // User requested "Richtige antwort ist Nein".
    // "Ja" -> Red, "Nein" -> Green.
    // If we use simple colors array, it depends on key order.
    // Let's try simple first: ['#F56565', '#48BB78'] for Ja (Red), Nein (Green).
    createChart('chartSensorsComb', 'Kombination nötig?', combData, ['#F56565', '#48BB78']);

    // 5. Autonomiestufe (q5)
    // Level 2 (Correct), Others (Wrong)
    const subjData = processDataForChart('q5');
    // Map colors based on keys. Since keys are full text, we might need a smarter way or just a fixed array if we assume order/keys.
    // Order in chart usually follows key insertion or alphabetical.
    // Let's explicitly define color mapping or use a fixed order?
    // processDataForChart returns an object. Chart.js uses Object.values().
    // We should probably rely on a helper to ensure colors match labels if we want precision.
    // Or just assign colors: Green for "Level 2...", Red for others.

    // Quick fix: Map colors dynamically based on label content
    const q5Colors = Object.keys(subjData).map(label => label.includes('Level 2') ? '#48BB78' : '#F56565');

    createBarChart('chartSubjects', 'Antworten', subjData, q5Colors);

    // 4. Wahr oder Falsch (q6) - NEW Logic
    // Q6_1: Wahr (Correct)
    // Q6_2: Wahr (Correct)
    // Q6_3: Falsch (Correct)
    const quizData = calculateTrueFalseQuiz();
    createBarChart('chartBreaks', 'Richtig beantwortet (%)', quizData, '#38B2AC');

    // 5. Level 4 Autonomie (q9) - NEW
    const l4Data = processDataForChart('q9');
    createChart('chartLevel4', 'Einsteigen?', l4Data, ['#48BB78', '#F56565']); // Green (Ja), Red (Nein)

    // 5. Video Wahl (q11) - NEW Logic
    // Valid Answers: Video 1 (Mensch) is CORRECT
    const videoData = processVideoChoiceData();
    createChart('chartVideo', 'Mensch erkannt?', videoData, ['#48BB78', '#F56565']); // Green, Red

    // 6. Video Details (q11_details) - NEW Logic
    // Green: Geschwindigkeit, Spurhaltung
    // Red: Bremsgeschwindigkeit
    const detailData = processDataForChart('q11_details', ['Geschwindigkeit', 'Spurhaltung', 'Bremsgeschwindigkeit']);
    createObservationChart('chartVideoDetails', 'Beobachtungen (Anzahl)', detailData, ['#48BB78', '#48BB78', '#F56565']);

    // 7. Zufriedenheit (q10) - NEW Metric
    const avgSatisfaction = calculateAverage('q10');
    const metricEl = document.getElementById('metricQ10');
    if (metricEl) {
        metricEl.textContent = avgSatisfaction + '%';
    }

    // 8. Referat Bewertung (q12) - NEW Metric
    const avgRating = calculateAverage('q12');
    const metricEl12 = document.getElementById('metricQ12');
    if (metricEl12) {
        metricEl12.textContent = avgRating + '%';
    }

    // 9. Umfrage Bewertung (q13) - NEW Metric
    const avgSurvey = calculateAverage('q13');
    const metricEl13 = document.getElementById('metricQ13');
    if (metricEl13) {
        metricEl13.textContent = avgSurvey + '%';
    }
}

function calculateAverage(key) {
    let sum = 0;
    let count = 0;
    surveyData.forEach(entry => {
        const val = parseFloat(entry[key]);
        if (!isNaN(val)) {
            sum += val;
            count++;
        }
    });
    if (count === 0) return 0;
    return Math.round(sum / count);
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

    // Show last 10 answers for Q14 (Handlungsbedarf)
    const reversed = [...surveyData].reverse().slice(0, 10);

    reversed.forEach(entry => {
        if (entry.q14) {
            const div = document.createElement('div');
            div.className = 'answer-item';
            div.textContent = entry.q14;
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

function calculateSensorQuizScores() {
    // Key:
    // q3_1: C
    // q3_2: D
    // q3_3: A
    // q3_4: C
    // q3_5: B
    // q3_6: C

    // Total count of responses
    const total = surveyData.length;
    if (total === 0) return { "Erster Sensor (C)": 0, "Nässe/Nebel (D)": 0, "Punktwolke (A)": 0, "5m (B)": 0, "Funk (B)": 0, "Häufigkeit (C)": 0 };

    // Counts
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0;

    surveyData.forEach(entry => {
        if (entry.q3_1 === 'C') c1++;
        if (entry.q3_2 === 'D') c2++;
        if (entry.q3_3 === 'A') c3++;
        if (entry.q3_4 === 'C') c4++;
        if (entry.q3_5 === 'B') c5++;
        if (entry.q3_6 === 'C') c6++;
    });

    return {
        "Erster Sensor (C)": (c1 / total * 100).toFixed(1),
        "Nässe/Nebel (D)": (c2 / total * 100).toFixed(1),
        "Punktwolke (A)": (c3 / total * 100).toFixed(1),
        "5m (C)": (c4 / total * 100).toFixed(1),
        "Funk (B)": (c5 / total * 100).toFixed(1),
        "Häufigkeit (C)": (c6 / total * 100).toFixed(1)
    };
}

function calculateTrueFalseQuiz() {
    // Q6_1: Wahr
    // Q6_2: Wahr
    // Q6_3: Falsch

    const total = surveyData.length;
    if (total === 0) return { "Level 5 (Wahr)": 0, "Mercedes L3 (Wahr)": 0, "Tesla L5 (Falsch)": 0 };

    let c1 = 0, c2 = 0, c3 = 0;

    surveyData.forEach(entry => {
        if (entry.q6_1 === 'Wahr') c1++;
        if (entry.q6_2 === 'Wahr') c2++;
        if (entry.q6_3 === 'Falsch') c3++;
    });

    return {
        "Level 5 (Wahr)": (c1 / total * 100).toFixed(1),
        "Mercedes L3 (Wahr)": (c2 / total * 100).toFixed(1),
        "Tesla L5 (Falsch)": (c3 / total * 100).toFixed(1)
    };
}

function createBarChart(canvasId, label, dataObj, color) {
    const element = document.getElementById(canvasId);
    if (!element) return;
    const ctx = element.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: label,
                data: Object.values(dataObj),
                backgroundColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Prozent Richtig'
                    }
                }
            }
        }
    });
}

function processVideoChoiceData() {
    let correct = 0;
    let wrong = 0;

    surveyData.forEach(entry => {
        // "Video 1" is Correct, "Video 2" is Wrong
        if (entry.q11 && entry.q11.includes('Video 1')) {
            correct++;
        } else if (entry.q11 && entry.q11.includes('Video 2')) {
            wrong++;
        }
    });

    return { "Richtig (Mensch)": correct, "Falsch (Autonom)": wrong };
}

function createObservationChart(canvasId, label, dataObj, color) {
    const element = document.getElementById(canvasId);
    if (!element) return;
    const ctx = element.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataObj),
            datasets: [{
                label: label,
                data: Object.values(dataObj),
                backgroundColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30, // Max count 30 as requested
                    title: {
                        display: true,
                        text: 'Anzahl Antworten'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}
