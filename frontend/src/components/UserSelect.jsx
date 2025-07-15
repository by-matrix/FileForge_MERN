import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserSelect = ({ value, onChange, disabled = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsers([
        { id: 'b45c9f21-9cdf-4355-b9a6-2c4408a0b76f', name: 'Regular User', department: 'Finance Department' },
        { id: '7489fe8e-0aca-499b-9328-98df5dbc4abf', name: 'New Admin', department: 'IT Department' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
        Loading users...
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
    >
      <option value="">Select a user...</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.department})
        </option>
      ))}
    </select>
  );
};

export default UserSelect;