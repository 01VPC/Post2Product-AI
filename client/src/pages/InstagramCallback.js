import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InstagramCallback() {
  const [status, setStatus] = useState('Connecting...');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const email = params.get('state');
    if (!code || !email) {
      setStatus('Missing code or state in callback URL.');
      return;
    }
    axios.get('/api/insta-connect/instagram/callback', {
      params: { code, state: email }
    })
      .then(() => {
        setStatus('Instagram connected successfully!');
        setTimeout(() => navigate('/instagram'), 1500);
      })
      .catch(err => {
        setStatus('Failed to connect Instagram: ' + (err.response?.data?.error || err.message));
      });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="text-lg">{status}</div>
    </div>
  );
}

export default InstagramCallback;