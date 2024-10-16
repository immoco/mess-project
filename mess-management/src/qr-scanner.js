import React, { useState, useRef } from 'react';
import QrScanner from 'react-qr-scanner'; // Ensure the QR scanner library is correctly imported
import attendanceFuncs from './attendance.js'
import './qrscanner.css';
import { Link } from 'react-router-dom';
import successSound from './success-sound.mp3';

function QRScanner({ user, showNotification}) {
  const [showScanner, setShowScanner] = useState(false);
  // eslint-disable-next-line
  const [constraints, setConstraints] = useState({
    video: { facingMode: "environment" }
  });
  const [scanSuccess, setScanSuccess] = useState(false);
  const {handleQRCodeScanned} = attendanceFuncs
  const successSoundRef = useRef(null);
  var scannedMessId;

  const handleScan = async (data) => {
    console.log(data)
    if (data && data.text) { // Ensure data has a text property
      const scannedValue = data.text; // Extract text value from data
      scannedMessId = scannedValue;
      // setScanResult(scannedValue);
      setShowScanner(false); // Hide the scanner after a successful scan
      const result = await handleQRCodeScanned({ messId: scannedMessId, user, showNotification} )
      if (result.success) {
        setScanSuccess(true);
        successSoundRef.current.play();
        setTimeout(() => setScanSuccess(false), 2000);
        showNotification(result.message)
      }
    }
  };

  const handleError = (err) => {
    console.error("Error scanning QR code:", err);
    showNotification("Error scanning QR code:")
  };

  const toggleScanner = () => {
    setShowScanner(!showScanner);
  };

  return (
    <div>
      <button onClick={toggleScanner} className='open-bt'>
        {showScanner ? 'Close Scanner' : 'Open Scanner'}
      </button>

      {showScanner && (
        <div className="qr-scanner-container">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            constraints= {constraints} 
          />
        </div>
         )}
      {!showScanner && (
        <div className="camera-issues-prompt">
          <p>Having camera issues? Try the <Link to="/codeword">codeword</Link> option.</p>
        </div>
      )}
      {scanSuccess && (
        <div className="success-tick">
          <span>✔️</span>
        </div>
      )}
      <audio ref={successSoundRef} src={successSound} />

    </div>
  );
}

export default QRScanner;
