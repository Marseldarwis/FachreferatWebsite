// HIER HINTERLEGEN: Die URL Ihres Google Apps Scripts
// Beispiel: https://script.google.com/macros/s/AKfycbx.../exec
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfD09dLRzCjzc8EPUCXbSSi113ln56pgmhhIOFSZDhE8EeNeSFzL18RRjgvXMIHyVbtA/exec';

document.getElementById('surveyForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Check if URL is set
    if (SCRIPT_URL.includes('YOUR_GOOGLE_SCRIPT_URL_HERE') || SCRIPT_URL === '') {
        alert('Bitte konfigurieren Sie zuerst die Google Apps Script URL in der Datei script.js!');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';

    // Collect data
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Add timestamp
    data.timestamp = new Date().toISOString();

    // Send data
    fetch(SCRIPT_URL, {
        method: 'POST',
        // mode: 'no-cors', // Important for GAS if not using correct headers, but 'cors' is better for error handling if script allows
        // To handle CORS properly, GAS must return JSON with appropriate headers.
        redirect: 'follow', // GAS redirects to a confirmation page usually, we need to follow or handle json
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // data sent as stringified body
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
            // Show success message
            messageDiv.textContent = 'Vielen Dank! Deine Antworten wurden gespeichert.';
            messageDiv.className = 'success';
            messageDiv.classList.remove('hidden');

            // Reset form
            document.getElementById('surveyForm').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            messageDiv.textContent = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Absenden';
        });
});
