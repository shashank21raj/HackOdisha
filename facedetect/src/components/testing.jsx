import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export const Testing = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState(''); // New state for status message
  const webcamRef = useRef(null);

  const handleCameraToggle = () => {
    setIsCameraActive(!isCameraActive);
    setImageSrc(null);
    setStatusMessage('');
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,16}$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  
    try {
      const formData = new FormData();
      formData.append('image', imageSrc);
      formData.append('account_number', cardNumber);

      if (imageSrc && cardNumber) {
        const res = await axios.post('http://127.0.0.1:5001/test', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        // Check for success status in the response
        if (res.data.status === 'success') {
          setStatusMessage('Face recognized successfully! Access granted.');
        } else {
          setStatusMessage('Face recognition failed. Please try again.');
        }
      }
    } catch (error) {
      console.log("Error in sending the file", error);
      setStatusMessage('An error occurred. Please try again.');
    }
  };
  

  return (
    <div className="h-screen bg-purple-300">
      <div className="flex justify-between">
        <div className="h-screen w-3/4 flex flex-col items-center justify-center">
          <div className="w-[640px] h-[480px] bg-black flex justify-center items-center">
            {isCameraActive && !imageSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full"
              />
            ) : (
              imageSrc && <img src={imageSrc} alt="Captured" className="" />
            )}
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleCameraToggle}
              className={`px-4 py-2 rounded-full ${
                isCameraActive ? 'bg-red-500' : 'bg-green-500'
              } text-white`}
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            <button
              onClick={handleCapture}
              disabled={!isCameraActive}
              className="bg-blue-500 px-4 py-2 rounded-full text-white"
            >
              Capture
            </button>
          </div>
        </div>

        <div className="h-screen w-1/4 flex flex-col justify-center items-center">
          <label className="text-xl font-bold mb-4">Enter Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="16-digit card number"
            className="border border-gray-400 rounded w-64 py-2 px-3"
            maxLength="16"
            required
          />

          <button
            className="bg-red-600 text-xl rounded-lg m-4 p-2"
            onClick={handleSubmit}
          >
            Submit
          </button>

          {/* Conditionally render the status message */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 text-white text-center rounded-lg ${
                statusMessage.includes('success')
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
