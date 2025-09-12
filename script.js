let qrScanner = null;
let stamps = [];

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

function showScreen(screenId) {
    document.querySelectorAll('#welcome-screen, #scanning-screen, #passport-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function startScanning() {
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
    if (qrScanner) {
        qrScanner.stop();
    }
    showScreen('welcome-screen');
}

function handleQRCode(data) {
    try {
        // Expected: just the file name of the stamp image, e.g. "France.png"
        const fileName = data.trim();

        if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg')) {
            showMessage('Invalid QR code format', 'error');
            return;
        }

        const imagePath = `images/stamps/${fileName}`;
        const locationName = fileName.replace(/\.[^/.]+$/, ""); // remove file extension

        // Check if already collected
        if (stamps.find(stamp => stamp.location === locationName)) {
            showMessage('You already have this stamp!', 'error');
            return;
        }

        // Add new stamp
        const newStamp = {
            location: locationName,
            image: imagePath,
            timestamp: new Date().toLocaleString()
        };

        stamps.push(newStamp);
        saveStamps(); // save progress
        showMessage(`New stamp added: ${locationName}!`, 'success');
        updateStampsDisplay();

        // Auto-show passport after collecting a stamp
        setTimeout(() => {
            showPassport();
        }, 1500);

    } catch (error) {
        console.error(error);
        showMessage('Invalid QR code format', 'error');
    }
}

function showPassport() {
    if (qrScanner) {
        qrScanner.stop();
    }
    showScreen('passport-screen');
    updateStampsDisplay();
}

function updateStampsDisplay() {
    const container = document.getElementById('stamps-container');
    const countElement = document.getElementById('stamps-count');
    
    countElement.textContent = stamps.length;
    
    if (stamps.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No stamps collected yet. Start scanning QR codes!</p>';
        return;
    }
    
    container.innerHTML = stamps.map(stamp => `
        <div class="stamp">
            <img src="${stamp.image}" alt="${stamp.location}" onerror="this.style.display='none'">
            <div class="stamp-location">${stamp.location}</div>
            <div class="stamp-time">${stamp.timestamp}</div>
        </div>
    `).join('');
}

function downloadPassport() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1000;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, 120);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛂 DIGITAL PASSPORT', canvas.width/2, 50);
    ctx.font = '18px Arial';
    ctx.fillText('Journey Collection', canvas.width/2, 80);
    
    // Stamps count
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${stamps.length} Stamps Collected`, canvas.width/2, 160);
    
    // Draw stamps
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    stamps.forEach((stamp, index) => {
        const x = 50 + (index % 2) * 350;
        const y = 220 + Math.floor(index / 2) * 150;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 300, 120);
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(stamp.location, x + 10, y + 30);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(stamp.timestamp, x + 10, y + 55);
        
        ctx.font = '40px Arial';
        ctx.fillText('🏛️', x + 240, y + 70);
    });
    
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleString()}`, canvas.width/2, canvas.height - 20);
    
    const link = document.createElement('a');
    link.download = `digital-passport-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showMessage('Passport image downloaded!', 'success');
}

// ---- Local Storage Support ----
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

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    if (!QrScanner.hasCamera()) {
        showMessage('No camera found on this device', 'error');
    }
    loadStamps(); // restore saved progress
});
