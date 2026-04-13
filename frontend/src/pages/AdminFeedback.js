import React, { useState, useEffect } from 'react';
//import { Link } from 'react-router-dom';
import Header from '../components/Header';

function AdminFeedback({ userRole, onLogout }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let initialLoad = true;
    const fetchFeedback = async () => {
  try {
    if (initialLoad) setLoading(true);
    console.log('Fetching feedback...');
    const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/api/feedback`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    
    const data = await response.json();
    setFeedback(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching feedback:', error);
  } finally {
    setLoading(false);
    initialLoad = false;
  }
};

    fetchFeedback();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchFeedback, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`Updating feedback ${id} to status:`, newStatus);
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://mypersonalchef.onrender.com"}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status: ${response.statusText}`);
      }

      const updatedFeedback = await response.json();
      console.log('Updated feedback:', updatedFeedback);

      // Update the local state to reflect the change
      setFeedback(feedback.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
      
      alert(`Feedback marked as ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating feedback status:', {
        error,
        message: error.message,
        stack: error.stack
      });
      alert(`Failed to update feedback status: ${error.message}`);
    }
  };

  const filteredFeedback = statusFilter === 'all' 
    ? feedback 
    : feedback.filter(item => item.status === statusFilter);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815] flex items-center justify-center">
        <p className="text-white text-lg">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] via-[#1f3a1f] to-[#152815]">
      <Header userRole={userRole} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Feedback Management</h1>
            <p className="text-[#a3b99d]">View and manage user feedback for recipes</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1e271c] border border-[#2c3928] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Feedback</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="bg-[#1e271c] border border-[#2c3928] rounded-xl p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-[#2c3928] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              ></path>
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No feedback found</h3>
            <p className="text-[#a3b99d] mb-6">
              {statusFilter === 'all'
                ? 'There is no feedback to display.'
                : `No ${statusFilter} feedback found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ul className="divide-y divide-[#2c3928]">
              {filteredFeedback.map((item) => (
                <li key={item._id} className="p-6 hover:bg-[#1e271c]/50 transition-colors">
                  <div className="flex flex-col space-y-4">
                    {/* Header with name, date, and status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-[#a3b99d] mt-1">
                          {item.email} • {formatDate(item.createdAt || new Date())}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(item.status)}`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✓ Approved</option>
                          <option value="rejected">✗ Rejected</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Recipe info */}
                    <div className="bg-[#182216] p-3 rounded-lg border border-[#2c3928]">
                      <p className="text-sm text-[#a3b99d]">
                        For recipe: <span className="text-white font-medium">{item.recipeTitle || 'Unknown Recipe'}</span>
                      </p>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`text-xl ${star <= item.rating ? 'text-yellow-400' : 'text-[#3a4a38]'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-[#a3b99d]">
                        {item.rating}.0 rating
                      </span>
                    </div>
                    
                    {/* Comment */}
                    <p className="text-[#e2e8f0] mb-4">{item.comment}</p>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'approved')}
                          className="px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'rejected')}
                          className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      {item.status !== 'pending' && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'pending')}
                          className="px-3 py-1 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
                        >
                          Set as Pending
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;
