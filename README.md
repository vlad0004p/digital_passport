# Digital Passport

A web application that allows users to collect digital stamps by scanning QR codes at different locations, view their passport online, and download it once all stamps are collected.

---

## Table of Contents

- [Demo](#demo)  
- [Features](#features)  
- [Technologies](#technologies)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Credits](#credits)  

---

## Demo

![Passport Screenshot](images/stars_background.jpg)  

---

## Features

- Collect stamps by scanning QR codes.
- Prevent duplicate stamp collection.
- Display a passport with collected stamps.
- Automatically hide/show buttons based on progress.
- Download passport as a PNG image **once all stamps are collected**.
- Reset passport to start over.
- Persistent progress using local storage.

---

## Technologies

- **HTML5** – Structure of the web page.
- **CSS3** – Styling, layout, and responsiveness.
- **JavaScript** – Logic for QR scanning, stamps, passport rendering, and storage.
- **[QR Scanner](https://github.com/nimiq/qr-scanner)** – Open-source library for QR code scanning.
- **Canvas API** – For generating the downloadable passport image.

---

## Installation

1. Clone or download the repository:

```
git clone https://github.com/yourusername/digital-passport.git
```

2. Navigate to the project folder:

```
cd digital-passport
```

3. Open `index.html` in a browser (Chrome or Firefox recommended).  

> ⚠️ The QR scanner requires HTTPS or `localhost` to access the camera.

---

## Usage

1. Open the app in your browser.
2. Click **Collect your first stamp** to start scanning.
3. Scan QR codes at the locations.
4. Collected stamps will appear in your digital passport.
5. Once all 6 stamps are collected:
   - The **Scan More QR Codes** button disappears.
   - The **Download Passport** button becomes available.
6. Click **Download Passport** to save a PNG image of your passport.
7. Click **Reset Passport** to start over.

---

## Project Structure

```
digital-passport/
│
├── images/
│   ├── stamps/         # Stamp images
│   └── stars_background.jpg
│
├── index.html          # Main HTML page
├── style.css           # CSS styling
├── script.js           # JavaScript logic
└── README.md           # Project documentation
```

---

## Credits

- QR code scanning powered by [QR Scanner](https://github.com/nimiq/qr-scanner)
- Icons and emojis from standard Unicode symbols.
- Background image: user-provided.
