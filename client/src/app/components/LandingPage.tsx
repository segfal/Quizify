'use client'
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch data when component mounts
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));
  }, []);

  const handlePostRequest = () => {
    fetch('/api/hello', {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error posting message:', error));
  };

  return (
    <div>
      <div>
        <h1>Welcome to Our App</h1>
        <p>API Response: {message}</p>
        <button onClick={handlePostRequest}>
          Make POST Request
        </button>
        <button onClick={() => router.push('/login')}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 