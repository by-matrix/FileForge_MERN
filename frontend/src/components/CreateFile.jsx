import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserSelect from './UserSelect';
import api from '../services/api';

const CreateFile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fileNumber: '',
    dispatchedDate: '',
    to: '',
    currentStatus: 'Pending',
    remarks: ''
  });

  const fileStatuses = [
    'Pending',
    'In Progress',
    'Completed',
    'Reject',
    'Archived',
    'Urgent'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/files', {
        ...formData,
        dispatchedDate: new Date(formData.dispatchedDate).toISOString()
      });
      
      navigate('/files');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error creating file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New File</h1>
        <p className="text-gray-600 mt-2">
          Add a new file to the system
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fileNumber" className="block text-sm font-medium text-gray-700 mb-2">
              File Number *
            </label>
            <input
              type="text"
              id="fileNumber"
              name="fileNumber"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter file number"
              value={formData.fileNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="dispatchedDate" className="block text-sm font-medium text-gray-700 mb-2">
              Dispatched Date *
            </label>
            <input
              type="date"
              id="dispatchedDate"
              name="dispatchedDate"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.dispatchedDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              Assign To *
            </label>
            <UserSelect
              value={formData.to}
              onChange={(value) => setFormData({...formData, to: value})}
            />
            <p className="mt-1 text-sm text-gray-500">
              Select the user this file should be assigned to
            </p>
          </div>

          <div>
            <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Current Status *
            </label>
            <select
              id="currentStatus"
              name="currentStatus"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.currentStatus}
              onChange={handleChange}
            >
              {fileStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter any additional remarks or notes..."
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/files')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFile;