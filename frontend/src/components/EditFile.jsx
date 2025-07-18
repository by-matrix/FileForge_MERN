import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserSelect from './UserSelect';
import api from '../services/api';

const EditFile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
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

  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      console.log('=== DEBUG INFO ===');
      console.log('User:', user);
      console.log('Fetching file with ID:', id, 'Type:', typeof id);
      
      let allFiles = [];
      
      //assigned files
      try {
        const assignedResponse = await api.get('/files');
        console.log('Assigned files response:', assignedResponse.data);
        if (Array.isArray(assignedResponse.data)) {
          allFiles = [...allFiles, ...assignedResponse.data];
        }
      } catch (error) {
        console.error('Error fetching assigned files:', error);
      }
      
      //uploaded files
      try {
        const uploadedResponse = await api.get('/files/uploaded');
        console.log('Uploaded files response:', uploadedResponse.data);
        if (Array.isArray(uploadedResponse.data)) {
          allFiles = [...allFiles, ...uploadedResponse.data];
        }
      } catch (error) {
        console.error('Error fetching uploaded files:', error);
      }
      
      //all files if admin
      if (user?.role === 'admin') {
        try {
          const allResponse = await api.get('/files/all');
          console.log('All files response:', allResponse.data);
          if (Array.isArray(allResponse.data)) {
            allFiles = [...allFiles, ...allResponse.data];
          }
        } catch (error) {
          console.error('Error fetching all files:', error);
        }
      }
      
      // Remove duplicates based on ID (id)
      const uniqueFiles = allFiles.filter((file, index, self) => 
        index === self.findIndex(f => f.id === file.id)
      );
      
      console.log('All unique files:', uniqueFiles);
      console.log('File IDs available:', uniqueFiles.map(f => ({ id: f.id, type: typeof f.id })));
      
      // Try both string and number comparison
      const fileIdString = id;
      const fileIdNumber = parseInt(id, 10);
      
      console.log('Looking for file with ID:', fileIdString, '(string) or', fileIdNumber, '(number)');
      
      const foundFile = uniqueFiles.find(f => {
        console.log('Comparing file:', f.id, 'Type:', typeof f.id, 'with', fileIdString, '/', fileIdNumber);
        return f.id === fileIdString || f.id === fileIdNumber || f.id.toString() === fileIdString;
      });
      
      console.log('Found file:', foundFile);
      
      if (!foundFile) {
        console.log('File not found in any endpoint');
        setError(`File not found. Available file IDs: ${uniqueFiles.map(f => f.id).join(', ')}`);
        return;
      }

      // Check permissions
      const hasPermission = user?.role === 'admin' || foundFile.to === user?.id || foundFile.uploadedBy === user?.id;
      console.log('Permission check:', {
        userRole: user?.role,
        fileTo: foundFile.to,
        fileUploadedBy: foundFile.uploadedBy,
        userId: user?.id,
        hasPermission
      });

      if (!hasPermission) {
        setError('You do not have permission to view this file');
        return;
      }

      setFile(foundFile);
      setFormData({
        fileNumber: foundFile.fileNumber,
        dispatchedDate: foundFile.dispatchedDate.split('T')[0],
        to: foundFile.to,
        currentStatus: foundFile.currentStatus,
        remarks: foundFile.remarks || ''
      });
    } catch (error) {
      console.error('Error fetching file:', error);
      setError(error.response?.data?.detail || 'Error fetching file');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      console.log('=== SAVE DEBUG INFO ===');
      console.log('File ID:', id);
      console.log('Form data being sent:', formData);
      
      const updateData = {
        ...formData,
        dispatchedDate: new Date(formData.dispatchedDate).toISOString()
      };
      
      console.log('Update data with ISO date:', updateData);
      
      let response;
      let success = false;
      
      // Try different HTTP methods and endpoints
      const methodsToTry = [
        { method: 'put', endpoint: `/files/${id}` },
        { method: 'patch', endpoint: `/files/${id}` },
        { method: 'post', endpoint: `/files/${id}/update` },
        { method: 'put', endpoint: `/files/update/${id}` }
      ];
      
      for (const { method, endpoint } of methodsToTry) {
        try {
          console.log(`Trying ${method.toUpperCase()} request to:`, endpoint);
          response = await api[method](endpoint, updateData);
          console.log(`${method.toUpperCase()} response:`, response.data);
          success = true;
          break;
        } catch (error) {
          console.log(`${method.toUpperCase()} failed with status:`, error.response?.status);
          if (error.response?.status === 404 || error.response?.status === 405) {
            continue; // Try next method
          } else {
            throw error; // Other errors should be thrown
          }
        }
      }
      
      // Temporary workaround: If no update endpoint exists, 
      // you might need to work with your existing endpoints
      // This is just a placeholder - replace with your actual update logic
      
      if (!success) {
        // Check if your backend has a different update pattern
        console.log('Trying alternative update methods...');
        
        // Method 1: Check if there's a general files endpoint that accepts updates
        try {
          response = await api.post('/files', { ...updateData, id: id });
          console.log('POST to /files with ID response:', response.data);
          success = true;
        } catch (error) {
          console.log('POST to /files failed:', error.response?.status);
        }
        
        // Method 2: If still no success, you might need to implement the backend endpoint
        if (!success) {
          throw new Error(`No update endpoint found. Please add one of these endpoints to your backend:
            - PUT /api/files/${id}
            - PATCH /api/files/${id}
            - POST /api/files/${id}/update
            - PUT /api/files/update/${id}`);
        }
      }
      
      // Show success message
      alert('File updated successfully!');
      navigate('/files');
    } catch (error) {
      console.error('Error updating file:', error);
      console.error('Error response:', error.response);
      
      // Try to get more specific error message
      let errorMessage = 'Error updating file';
      
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        
        if (error.response.status === 404) {
          errorMessage = 'Update endpoint not found. Your backend needs a PUT /api/files/:id endpoint.';
        } else if (error.response.status === 405) {
          errorMessage = 'Method not allowed. Your backend might not support the HTTP method used.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to update this file.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || error.response.data?.message || 'Invalid data provided for update.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const canEdit = () => {
    if (!file || !user) return false;
    
    const isAdmin = user.role === 'admin';
    const isAssignedTo = file.to === user.id;
    const isUploadedBy = file.uploadedBy === user.id;
    
    console.log('Edit permission check:', {
      isAdmin,
      isAssignedTo,
      isUploadedBy,
      fileData: { to: file.to, uploadedBy: file.uploadedBy },
      userData: { id: user.id, role: user.role }
    });
    
    return isAdmin || isAssignedTo || isUploadedBy;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Reject':
        return 'bg-red-100 text-red-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error && !file) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/files')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {canEdit() ? 'Edit File' : 'View File'}
        </h1>
        <p className="text-gray-600 mt-2">
          File Number: {file?.fileNumber}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* File Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">File Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Uploaded By:</span>
              <p className="font-medium">{file?.uploadedByName || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Upload Date:</span>
              <p className="font-medium">{new Date(file?.uploadDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Current Status:</span>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file?.currentStatus)}`}>
                  {file?.currentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
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
              disabled={!canEdit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
              disabled={!canEdit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
              disabled={!canEdit()}
            />
          </div>

          <div>
            <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Current Status *
            </label>
            <select
              id="currentStatus"
              name="currentStatus"
              required
              disabled={!canEdit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
              disabled={!canEdit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
              Back to Files
            </button>
            {canEdit() && (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFile;