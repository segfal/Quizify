'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Dummy users database
const USERS = new Map([
  ['john_doe', 'password123'],
  ['alice_smith', 'securepass'],
  ['bob_jones', 'letmein'],
]);

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (USERS.get(username) === password) {
      router.push('/dashboard');
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div>
      <div>
        <h1>Login</h1>
        
        {error && (
          <div>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 