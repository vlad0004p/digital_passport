let qrScanner = null;
let stamps = [];

// -------------------------
// Messages
// -------------------------
function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(messageDiv);

    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// -------------------------
// Screen Navigation
// -------------------------
function showScreen(screenId) {
    document.querySelectorAll('#welcome-screen, #scanning-screen, #passport-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// -------------------------
// QR Scanning
// -------------------------
function startScanning() {
    if (stamps.length >= 6) {
        showMessage('You have already collected all available stamps!', 'error');
        return;
    }

    showScreen('scanning-screen');
    const video = document.getElementById('qr-video');

    if (!qrScanner) {
        qrScanner = new QrScanner(
            video,
            result => handleQRCode(result.data),
            {
                returnDetailedScanResult: true,
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );
    }

    qrScanner.start().catch(err => {
        console.error('QR Scanner error:', err);
        showMessage('Camera access denied or not available', 'error');
    });
}

function stopScanning() {
    if (qrScanner) qrScanner.stop();
    showScreen('welcome-screen');
}

function handleQRCode(data) {
    try {
        if (stamps.length >= 6) {
            showMessage('You have already collected all available stamps!', 'error');
            return;
        }

        const fileName = data.trim();
        if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg')) {
            showMessage('Invalid QR code format', 'error');
            return;
        }

        const imagePath = `images/stamps/${fileName}`;
        const locationName = fileName.replace(/\.[^/.]+$/, "");

        if (stamps.find(stamp => stamp.image === imagePath)) {
            showMessage(`You already collected ${locationName}!`, 'error');
            return;
        }

        const newStamp = {
            location: locationName,
            image: imagePath,
            timestamp: new Date().toLocaleString()
        };
        stamps.push(newStamp);
        saveStamps();
        updateStampsDisplay();

        setTimeout(() => showPassport(), 1500);

    } catch (error) {
        console.error(error);
        showMessage('Invalid QR code format', 'error');
    }
}

// -------------------------
// Passport Display
// -------------------------
function showPassport() {
    if (qrScanner) qrScanner.stop();
    showScreen('passport-screen');
    updateStampsDisplay();
}

function updateStampsDisplay() {
    const container = document.getElementById('stamps-container');
    const countElement = document.getElementById('stamps-count');

    countElement.textContent = stamps.length;

    // Update buttons visibility
    updateButtonsState();

    if (stamps.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No stamps collected yet. Start scanning QR codes!</p>';
        return;
    }

    container.innerHTML = stamps.map(stamp => `
        <div class="stamp">
            <img src="${stamp.image}" alt="${stamp.location}" onerror="this.style.display='none'">
        </div>
    `).join('');
}

// -------------------------
// Buttons Visibility
// -------------------------
function updateButtonsState() {
    const startButton = document.getElementById('start-scanning-btn');
    const downloadButton = document.getElementById('download-passport-btn');

    if (stamps.length >= 6) {
        if (startButton) startButton.style.display = "none";
        if (downloadButton) downloadButton.style.display = "inline-block";
    } else {
        if (startButton) startButton.style.display = "inline-block";
        if (downloadButton) downloadButton.style.display = "none";
    }
}

// -------------------------
// Download Passport (matches on-screen)
 // -------------------------
function downloadPassport() {
    if (stamps.length < 6) {
        showMessage('You must collect all 6 stamps before downloading your passport!', 'error');
        return;
    }

    const passportElement = document.querySelector('.passport-container');

    // Use html2canvas to capture the full container including background
    html2canvas(passportElement, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `digital-passport-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showMessage('Passport image downloaded!', 'success');
    });
}


// -------------------------
// Reset Passport
// -------------------------
function resetPassport() {
    if (confirm("Are you sure you want to reset your passport and start over?")) {
        stamps = [];
        localStorage.removeItem('passportStamps');
        updateStampsDisplay();
        showMessage('Passport has been reset. You can start scanning again!', 'success');
    }
}

// -------------------------
// Local Storage Support
// -------------------------
function saveStamps() {
    localStorage.setItem('passportStamps', JSON.stringify(stamps));
}

function loadStamps() {
    const saved = localStorage.getItem('passportStamps');
    if (saved) {
        stamps = JSON.parse(saved);
        updateStampsDisplay();
    }
}

// -------------------------
// Initialize App
// -------------------------
document.addEventListener('DOMContentLoaded', function() {
    if (!QrScanner.hasCamera()) {
        showMessage('No camera found on this device', 'error');
    }
    loadStamps();
});
