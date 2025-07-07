import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    class: '',
    priority: '',
    active: 'true'
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetClass: 'all',
    priority: 'medium',
    author: ''
  });

  const fetchNotices = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API_BASE_URL}/notices?${params}`);
      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingNotice 
        ? `${API_BASE_URL}/notices/${editingNotice._id}`
        : `${API_BASE_URL}/notices`;
      
      const method = editingNotice ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowForm(false);
      setEditingNotice(null);
      setFormData({
        title: '', content: '', type: 'general', 
        targetClass: 'all', priority: 'medium', author: ''
      });
      fetchNotices();
    } catch (error) {
      console.error('Error saving notice:', error);
    }
  };

  const toggleNotice = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notices/${id}/toggle`, { method: 'PATCH' });
      fetchNotices();
    } catch (error) {
      console.error('Error toggling notice:', error);
    }
  };

  const deleteNotice = async (id) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await fetch(`${API_BASE_URL}/notices/${id}`, { method: 'DELETE' });
        fetchNotices();
      } catch (error) {
        console.error('Error deleting notice:', error);
      }
    }
  };

  const startEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      targetClass: notice.targetClass,
      priority: notice.priority,
      author: notice.author
    });
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Notice Board</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Notice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <select 
          value={filters.type} 
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="academic">Academic</option>
          <option value="event">Event</option>
          <option value="urgent">Urgent</option>
        </select>

        <select 
          value={filters.class} 
          onChange={(e) => setFilters({...filters, class: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Classes</option>
          <option value="all">All</option>
          <option value="1">Class 1</option>
          <option value="2">Class 2</option>
          <option value="3">Class 3</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          value={filters.active} 
          onChange={(e) => setFilters({...filters, active: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingNotice ? 'Edit Notice' : 'Add Notice'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full border rounded px-3 py-2 h-24"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={formData.targetClass}
                onChange={(e) => setFormData({...formData, targetClass: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="all">All Classes</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="text"
                placeholder="Author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingNotice ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingNotice(null);
                    setFormData({
                      title: '', content: '', type: 'general', 
                      targetClass: 'all', priority: 'medium', author: ''
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice._id} className={`border rounded-lg p-4 ${!notice.isActive ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-lg">{notice.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  notice.priority === 'high' ? 'bg-red-100 text-red-800' : 
                  notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {notice.priority}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{notice.content}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span>By: {notice.author}</span>
                <span className="ml-4">Type: {notice.type}</span>
                <span className="ml-4">Class: {notice.targetClass}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(notice)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => toggleNotice(notice._id)}
                  className={`text-sm ${notice.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                >
                  {notice.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => deleteNotice(notice._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;