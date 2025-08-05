'use client'
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const TestAuth = () => {
  const { getToken, user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testAuth = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log('Token:', token);
      
      const { data } = await axios.get('/api/test-auth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResult(data);
      toast.success('Auth test successful!');
    } catch (error) {
      console.error('Auth test error:', error);
      setResult({
        success: false,
        message: error?.response?.data?.message || error.message
      });
      toast.error('Auth test failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-4">
        <p><strong>User:</strong> {user ? user.emailAddresses[0]?.emailAddress : 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
        <p><strong>Role:</strong> {user?.publicMetadata?.role || 'No role set'}</p>
      </div>

      <button
        onClick={testAuth}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Result:</h3>
          <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth; 