import { useState, useEffect } from 'react';
import { healthApi } from '../services/api';
import type { HealthCheckResponse } from '../services/api';
import { AxiosError } from 'axios';

const HealthCheck = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await healthApi.check();
        setHealth(response.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        if (axiosError.response) {
          setError(`Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        } else if (axiosError.request) {
          setError('Backend is not reachable. Make sure the API is running on http://localhost:5000');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Checking backend health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-semibold mb-1">Backend Connection Failed</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (health) {
    const formattedTime = new Date(health.timestamp).toLocaleString();
    
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-green-800 font-semibold mb-2">Backend is {health.status}</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p><span className="font-medium">Service:</span> {health.service}</p>
              <p><span className="font-medium">Timestamp:</span> {formattedTime}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HealthCheck;
