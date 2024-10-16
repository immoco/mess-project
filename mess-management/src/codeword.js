import React, { useState, useRef } from 'react';
import { db, collection, query, where , getDocs} from './firebase.js'; // Import Firestore
import attendanceFuncs from './attendance'
import successSound from './success-sound.mp3';
import './codeword.css';

function CodewordInput({user, showNotification}) {
  const [codeword, setCodeword] = useState('');
  const [codeSuccess, setcodeSuccess] = useState(false);
  const successSoundRef = useRef(null);

  //function imported
  const {handleQRCodeScanned} = attendanceFuncs
  const handleVerify = async () => {
    try {
      const ref = collection(db, "mess");
      const q = query(
        ref,
        where ('codeWord', '==', codeword)
      )

      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const messId = doc.data().uid;
        // Record attendance with messID
        const result = await handleQRCodeScanned({messId, user, showNotification});
        if (result.success) {
          setcodeSuccess(true);
          successSoundRef.current.play();
          setTimeout(() => setcodeSuccess(false), 2000);
          showNotification(result.message); // Show notification with message
        } 
        else {
            showNotification(result.message);
        // setMessage('Attendance recorded successfully.');
        }
      } else {
        showNotification('Invalid codeword.'); // Show notification with error message
      }
    } catch (error) {
      console.error('Error verifying codeword:', error);
      showNotification('Error verifying codeword.');
    }
  };

  

  return (
    <div className="codeword-container">
      <input
        type="text"
        value={codeword}
        onChange={(e) => setCodeword(e.target.value)}
        placeholder="Enter codeword"
      />
      <button onClick={handleVerify}>Verify</button>
      {codeSuccess && (
        <div className="success-tick">
          <span>✔️</span>
        </div>
      )}
      <audio ref={successSoundRef} src={successSound} />
    </div>
  );
}

export default CodewordInput;
