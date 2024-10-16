import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './AttendanceCard.css'; // Import your CSS
import { format } from 'date-fns';
import ConfettiExplosion from 'react-confetti-explosion';

const AttendanceCard = ({ userEmail }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedCells, setFlippedCells] = useState({});
  const [showCard, setShowCard] = useState(false); // New state to toggle the card
  const [rotateCard, setRotateCard] = useState(false); // New state to manage rotation

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('studentEmail', '==', userEmail),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setAttendanceData({});
        } else {
          const attendanceRecords = {};

          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            const dateKey = data.timestamp.toDate();
            const formattedDate = format(dateKey, "MMM d yyyy")

            if (!attendanceRecords[formattedDate]) {
              attendanceRecords[formattedDate] = {
                BREAKFAST: { time: null, scanned: false },
                LUNCH: { time: null, scanned: false },
                DINNER: { time: null, scanned: false }
              };
            }

            const mealTimeObj = data.timestamp.toDate();
            const mealTime = format(mealTimeObj, "hh:mm a")
            attendanceRecords[formattedDate][data.meal] = { time: mealTime, scanned: true };
          });

          setAttendanceData(attendanceRecords);
          console.log(attendanceData)
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to fetch attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);


  const handleButtonClick = () => {
    <ConfettiExplosion/>
    setRotateCard(true); // Start rotation
    setTimeout(() => {
      setShowCard(true); // Show card after rotation
      setRotateCard(false); // Stop rotation
    }, 1000); // Adjust duration to match the rotation animation
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  

  const handleTickClick = (date, meal) => {
    if (attendanceData[date] && attendanceData[date][meal].scanned) {
    setFlippedCells(prev => ({
      ...prev,
      [`${date}-${meal}`]: !prev[`${date}-${meal}`]
    }));

    // Automatically flip back after 2 seconds
    setTimeout(() => {
      setFlippedCells(prev => ({
        ...prev,
        [`${date}-${meal}`]: false
      }));
    }, 1500);
    }
  };

//   return (
//     <div className="attendance-card-container">
//       <div className="attendance-card">
//         <div className="attendance-card-front">
//           <h2>Mess Attendance</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Breakfast</th>
//                 <th>Lunch</th>
//                 <th>Dinner</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(attendanceData).map(([date, meals]) => (
//                 <tr key={date}>
//                   <td>{date}</td>
//                   <td 
//                     onClick={() => handleTickClick(date, 'BREAKFAST')} 
//                     className={`clickable-cell ${flippedCells[`${date}-BREAKFAST`] ? 'flipped' : ''}`}
//                   >
//                     <div className="cell-inner">
//                       <div className="cell-front">
//                         {meals.BREAKFAST.scanned ? '✓' : 'N/A'}
//                       </div>
//                       <div className="cell-back">
//                         {meals.BREAKFAST.time || 'N/A'}
//                       </div>
//                     </div>
//                   </td>
//                   <td 
//                     onClick={() => handleTickClick(date, 'LUNCH')} 
//                     className={`clickable-cell ${flippedCells[`${date}-LUNCH`] ? 'flipped' : ''}`}
//                   >
//                     <div className="cell-inner">
//                       <div className="cell-front">
//                         {meals.LUNCH.scanned ? '✓' : 'N/A'}
//                       </div>
//                       <div className="cell-back">
//                         {meals.LUNCH.time || 'N/A'}
//                       </div>
//                     </div>
//                   </td>
//                   <td 
//                     onClick={() => handleTickClick(date, 'DINNER')} 
//                     className={`clickable-cell ${flippedCells[`${date}-DINNER`] ? 'flipped' : ''}`}
//                   >
//                     <div className="cell-inner">
//                       <div className="cell-front">
//                         {meals.DINNER.scanned ? '✓' : 'N/A'}
//                       </div>
//                       <div className="cell-back">
//                         {meals.DINNER.time || 'N/A'}
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

return (
  <div>
    <button onClick={handleButtonClick} className="show-card-button">Show Attendance Card</button>
    
    <div className={`attendance-card-container ${rotateCard ? 'rotate' : ''} ${showCard ? 'show' : 'hide'}`}>
      {showCard && (
        <div className="attendance-card">
          <h2>Mess Attendance</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(attendanceData).map(([date, meals]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td
                    onClick={() => handleTickClick(date, 'BREAKFAST')}
                    className={`clickable-cell ${flippedCells[`${date}-BREAKFAST`] ? 'flipped' : ''}`}
                  >
                    <div className="cell-inner">
                      <div className="cell-front">{meals.BREAKFAST.scanned ? '✓' : 'N/A'}</div>
                      <div className="cell-back">{meals.BREAKFAST.time || 'N/A'}</div>
                    </div>
                  </td>
                  <td
                    onClick={() => handleTickClick(date, 'LUNCH')}
                    className={`clickable-cell ${flippedCells[`${date}-LUNCH`] ? 'flipped' : ''}`}
                  >
                    <div className="cell-inner">
                      <div className="cell-front">{meals.LUNCH.scanned ? '✓' : 'N/A'}</div>
                      <div className="cell-back">{meals.LUNCH.time || 'N/A'}</div>
                    </div>
                  </td>
                  <td
                    onClick={() => handleTickClick(date, 'DINNER')}
                    className={`clickable-cell ${flippedCells[`${date}-DINNER`] ? 'flipped' : ''}`}
                  >
                    <div className="cell-inner">
                      <div className="cell-front">{meals.DINNER.scanned ? '✓' : 'N/A'}</div>
                      <div className="cell-back">{meals.DINNER.time || 'N/A'}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);
};

export default AttendanceCard;
