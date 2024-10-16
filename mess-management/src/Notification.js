// Notification.js
import React, {useEffect, useRef} from 'react';
import noti from './noti.mp3';
import './Notification.css'; // Import your CSS for styling

const Notification = ({ message }) => {
  const notiRef = useRef(null);
  useEffect(() => {
    if (notiRef.current) {
      notiRef.current.play();
    }
  }, []);
  
  return (
    <div className="notification">
    {message}
  <div className="timer">
    <div className="progress"></div>
  </div>
  <audio ref={notiRef} src={noti} />
  
</div>
  );
};

export default Notification;
