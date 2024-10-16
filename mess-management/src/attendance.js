import { doc, getDoc, collection, addDoc,Timestamp, query, where, getDocs } from 'firebase/firestore';
import {db} from './firebase.js'

async function handleQRCodeScanned ({messId, user, showNotification}) {
  try {
    // Verify that user and messId are provided
    if (!user && !messId) {
        return { success: false, message: "Invalid parameters." };
      }

    // Verify student's mess allotment
    const stuDoc = doc(db, "students", user.email);
    const studentDoc = await getDoc(stuDoc);
    if (!studentDoc.exists()) {
      showNotification("Student record not found." )
      return { success: false, message: "Student record not found." };
    }

    const studentData = studentDoc.data();
    console.log(studentData.messId)
    if (studentData.messId !== messId) {
      showNotification("You are not assigned to this mess." )
      return { success: false, message: "You are not assigned to this mess." };
    }

    if (!studentData.paymentStatus) {
      showNotification("Payment not verified.")
      return {success: false, message: "Payment not verified."}
    }

    const now = new Date();
    const paradoxStartDate = studentData.paradoxStartDate.toDate();
    const paradoxEndDate = studentData.paradoxEndDate.toDate();

    if (now < paradoxStartDate || now > paradoxEndDate) {
      showNotification("You can only scan the QR code during the Paradox event dates.");
      return { success: false, message: "You can only scan the QR code during the Paradox event dates." };
    }

    // Check current meal time
    const currentMeal = getCurrentMeal();
    if (!currentMeal) {
      showNotification("No meal is currently being served.")
      return { success: false, message: "No meal is currently being served." };
    }

    // Record attendance if valid
    const attendanceRecorded = await recordAttendance(user.email, messId, currentMeal, showNotification);

    if (attendanceRecorded.success) {
      return { success: false, message: `Attendance already recorded for ${currentMeal}.` };
    } 
    else if (attendanceRecorded) { 
      return { success: true, message: `Attendance recorded for ${currentMeal}.` };
    }
    else {
      return { success: false, message: "Failed to record attendance. Please try again." };
    }

  } catch (error) {
    console.error("Error handling QR code scan:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export function getCurrentMeal() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 7 && hour < 11) return 'BREAKFAST';
  if (hour >= 12 && hour < 16) return 'LUNCH';
  if (hour >= 19 && hour < 22) return 'DINNER';
  return null;
}

export async function recordAttendance(studentEmail, messId, meal, showNotification) {
  try {
    const attendanceRef = collection(db, 'attendance');
    console.log(attendanceRef)
    const now = new Date();
    // Check for existing attendance
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const q = query(
      attendanceRef,
      where('studentEmail', '==', studentEmail),
      where('messId', '==', messId),
      where('meal', '==', meal),
      where('timestamp', '>=', today)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      //alert('Attendance already recorded for this meal today');
      showNotification('Attendance already recorded for this meal today');
      return {success:true, message:'Attendance already recorded for this meal today'};
    }

    // Record new attendance
    const newAttendance = {
      studentEmail,
      messId,
      meal,
      timestamp: Timestamp.fromDate(now)
    };

    await addDoc(attendanceRef, newAttendance);
    console.log('Attendance recorded successfully');
    return true;

  } catch (error) {
    console.error('Error recording attendance:', error);
    return false;
  }
}

const attendanceFuncs= {handleQRCodeScanned, getCurrentMeal, recordAttendance};

export default attendanceFuncs