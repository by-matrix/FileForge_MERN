import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, filesResponse] = await Promise.all([
          api.get('/stats'),
          api.get('/files?limit=5')
        ]);
        
        setStats(statsResponse.data);
        setRecentFiles(filesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.department} • {user?.role === 'admin' ? 'Administrator' : 'User'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {user?.role === 'admin' ? (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.total_users || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Files</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats?.total_files || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uploaded Files</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.uploaded_files || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Files</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats?.status_breakdown?.Pending || 0}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assigned Files</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats?.assigned_files || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uploaded Files</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.uploaded_files || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Files</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats?.status_breakdown?.Pending || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats?.status_breakdown && Object.entries(stats.status_breakdown).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center ${getStatusColor(status)}`}>
                <span className="text-lg font-bold">{count}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
            <Link
              to="/files"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              View all files
            </Link>
          </div>
        </div>
        <div className="px-6 py-4">
          {recentFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files found</p>
          ) : (
            <div className="space-y-4">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{file.fileNumber}</h4>
                    <p className="text-sm text-gray-600">
                      Uploaded by: {file.uploadedByName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.currentStatus)}`}>
                      {file.currentStatus}
                    </span>
                    <Link
                      to={`/edit-file/${file.id}`}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/create-file"
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-6 text-center transition-colors"
        >
          <div className="text-2xl font-bold mb-2">Create New File</div>
          <div className="text-indigo-200">Add a new file to the system</div>
        </Link>
        <Link
          to="/files"
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-6 text-center transition-colors"
        >
          <div className="text-2xl font-bold mb-2">Manage Files</div>
          <div className="text-gray-200">View and manage all your files</div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;