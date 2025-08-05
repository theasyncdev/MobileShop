'use client'
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const TestClerk = () => {
  const { getToken, user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testClerk = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log('Token:', token);
      
      const { data } = await axios.get('/api/test-clerk', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResult(data);
      toast.success('Local database test successful!');
    } catch (error) {
      console.error('Local database test error:', error);
      setResult({
        success: false,
        message: error?.response?.data?.message || error.message
      });
      toast.error('Local database test failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Local Database User Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Current User Info (Frontend):</h2>
        <p><strong>User ID:</strong> {user ? user.id : 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'Not set'}</p>
      </div>

      <button
        onClick={testClerk}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Local Database Users'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Result:</h3>
          <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestClerk; 