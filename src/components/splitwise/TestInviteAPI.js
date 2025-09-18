import React, { useState } from 'react';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';

const TestInviteAPI = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { groups: groupsApi, invites: invitesApi } = useSplitwiseApi();

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const testGroupCreation = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting group creation test...', 'info');
      
      // Test group creation (only with creator, not other members)
      const groupData = {
        name: 'Test Group for Invitations',
        type: 'home',
        currencyCode: 'AUD',
        members: [
          { 
            id: 'current_user', 
            name: 'Test User', 
            email: 'test@example.com', 
            role: 'admin' 
          }
        ]
      };
      
      addResult(`📝 Creating group with data: ${JSON.stringify(groupData, null, 2)}`, 'info');
      
      const response = await groupsApi.create(groupData);
      const createdGroup = response.group;
      
      addResult(`✅ Group created successfully: ${JSON.stringify(createdGroup, null, 2)}`, 'success');
      
      // Test invitation sending
      addResult('📧 Testing invitation sending...', 'info');
      
      const inviteResponse = await invitesApi.sendInvite(createdGroup.id, {
        email: 'testmember@example.com',
        message: 'Test invitation message'
      });
      
      addResult(`✅ Invitation sent successfully: ${JSON.stringify(inviteResponse, null, 2)}`, 'success');
      
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
      addResult(`❌ Error details: ${JSON.stringify({
        message: error.message,
        status: error.status,
        response: error.response
      }, null, 2)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testSMTPHealth = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing SMTP health...', 'info');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/splitwise/invites/health`);
      const data = await response.json();
      
      addResult(`📊 SMTP Health Check: ${JSON.stringify(data, null, 2)}`, 'info');
      
    } catch (error) {
      addResult(`❌ SMTP Health Check Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing backend connection...', 'info');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      addResult(`📡 API URL: ${apiUrl}`, 'info');
      
      // Test basic connectivity
      const response = await fetch(`${apiUrl}/splitwise/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      addResult(`📊 Backend Response Status: ${response.status}`, 'info');
      addResult(`📊 Backend Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`, 'info');
      
      if (response.status === 401) {
        addResult('✅ Backend is running (401 = authentication required, which is expected)', 'success');
      } else if (response.ok) {
        const data = await response.json();
        addResult(`✅ Backend is running: ${JSON.stringify(data, null, 2)}`, 'success');
      } else {
        addResult(`⚠️ Backend responded with status: ${response.status}`, 'error');
      }
      
    } catch (error) {
      addResult(`❌ Backend Connection Error: ${error.message}`, 'error');
      addResult(`❌ This usually means the backend server is not running on port 3001`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test Invite API</h2>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testBackendConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        <button
          onClick={testSMTPHealth}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test SMTP Health'}
        </button>
        
        <button
          onClick={testGroupCreation}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Group Creation + Invite'}
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-sm ${
              result.type === 'success' ? 'bg-green-100 text-green-800' :
              result.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            <div className="font-mono text-xs text-gray-500 mb-1">
              {new Date(result.timestamp).toLocaleTimeString()}
            </div>
            <pre className="whitespace-pre-wrap">{result.message}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestInviteAPI;
