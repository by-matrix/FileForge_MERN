import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FileManager = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('assigned');

  const fileStatuses = [
    'Pending',
    'In Progress',
    'Completed',
    'Reject',
    'Archived',
    'Urgent'
  ];

  useEffect(() => {
    fetchFiles();
  }, [currentView, search, statusFilter]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let endpoint = '/files';
      
      if (currentView === 'uploaded') {
        endpoint = '/files/uploaded';
      } else if (currentView === 'all' && user?.role === 'admin') {
        endpoint = '/files/all';
      }

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      console.log('Fetching from:', `${endpoint}?${params}`);
      
      const response = await api.get(`${endpoint}?${params}`);
      
      console.log('API Response:', response.data);
      
      //should be array 
      const filesData = Array.isArray(response.data) ? response.data : [];
      
      //filter
      let filteredFiles = filesData;
      
      if (search) {
        filteredFiles = filteredFiles.filter(file => 
          file.fileNumber.toLowerCase().includes(search.toLowerCase()) ||
          (file.remarks && file.remarks.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      if (statusFilter) {
        filteredFiles = filteredFiles.filter(file => file.currentStatus === statusFilter);
      }
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
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

  const canEditFile = (file) => {
    return user?.role === 'admin' || file.to === user?.id;
  };

  const canDeleteFile = (file) => {
    return user?.role === 'admin' || file.to === user?.id;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all your files
        </p>
      </div>

      {/* Debug Info
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm">
          <strong>Debug Info:</strong> User ID: {user?.id}, Current View: {currentView}, Files Count: {files.length}
        </p>
      </div> */}

      {/* View Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-300">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView('assigned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'assigned'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setCurrentView('uploaded')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'uploaded'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Uploaded by Me
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Files
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search files by number or remarks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {fileStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <Link
          to="/create-file"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Create New File
        </Link>
      </div>

      {/* Files Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No files found</p>
            <p className="text-sm text-gray-400 mt-2">
              {currentView === 'assigned' ? 'No files assigned to you' : 
               currentView === 'uploaded' ? 'No files uploaded by you' : 
               'No files in the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispatched Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {file.fileNumber}
                      </div>
                      {file.remarks && (
                        <div className="text-sm text-gray-500">
                          {file.remarks}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(file.dispatchedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.currentStatus)}`}>
                        {file.currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.uploadedByName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-5">
                        <Link
                          to={`/edit-file/${file.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        {/* {canEditFile(file) && (
                          <Link
                            to={`/edit-file/${file.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                        )} */}
                        {canDeleteFile(file) && (
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;