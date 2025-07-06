import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Filter, Calendar, Clock, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1573';

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewMode, setViewMode] = useState('weekly'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    className: '',
    day: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacherId: '',
    room: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `${API_BASE_URL}/timetable`;
      const params = new URLSearchParams();
      
      if (selectedClass) params.append('class', selectedClass);
      if (selectedDay) params.append('day', selectedDay);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      if (viewMode === 'teacher' && selectedTeacher) {
        url = `${API_BASE_URL}/timetable/teacher/${selectedTeacher}`;
      } else if (viewMode === 'all') {
        url = `${API_BASE_URL}/timetable/all/classes`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (viewMode === 'teacher') {
        setTimetable(data.timetable || []);
      } else if (viewMode === 'all') {
        // Flatten the grouped data for display
        const flatData = [];
        Object.entries(data).forEach(([className, days]) => {
          Object.entries(days).forEach(([day, entries]) => {
            entries.forEach(entry => {
              flatData.push({ ...entry, className, day });
            });
          });
        });
        setTimetable(flatData);
      } else {
        setTimetable(data);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to fetch timetable data');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDay, selectedTeacher, viewMode]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers data');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes data');
    }
  };

  useEffect(() => {
    fetchTimetable();
    fetchTeachers();
    fetchClasses();
  }, [fetchTimetable]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = editingEntry 
        ? `${API_BASE_URL}/timetable/${editingEntry._id}` 
        : `${API_BASE_URL}/timetable`;
      const method = editingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      

    } catch (error) {
      console.error('Error saving timetable entry:', error);
      setError('Failed to save timetable entry');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      className: entry.className || '',
      day: entry.day || '',
      startTime: entry.startTime || '',
      endTime: entry.endTime || '',
      subject: entry.subject || '',
      teacherId: entry.teacherId || '',
      room: entry.room || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/timetable/${id}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        fetchTimetable();
      } catch (error) {
        console.error('Error deleting timetable entry:', error);
        setError('Failed to delete timetable entry');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormData({
      className: '',
      day: '',
      startTime: '',
      endTime: '',
      subject: '',
      teacherId: '',
      room: ''
    });
  };

  const formatTime = (time) => {
    return time ? new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not assigned';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timetable Management
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">View Mode</label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            disabled={loading}
          >
            <option value="weekly">Weekly View</option>
            <option value="teacher">Teacher View</option>
            <option value="all">All Classes</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            disabled={loading}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id || cls.name} value={cls.name || cls}>
                {cls.name || cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Day</label>
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            disabled={loading}
          >
            <option value="">All Days</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {viewMode === 'teacher' && (
          <div>
            <label className="block text-sm font-medium mb-2">Teacher</label>
            <select 
              value={selectedTeacher} 
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Timetable Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timetable.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No timetable entries found
                  </td>
                </tr>
              ) : (
                timetable.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.className}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.teacherData ? 
                        `${entry.teacherData.firstName} ${entry.teacherData.lastName}` : 
                        getTeacherName(entry.teacherId)
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.room}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingEntry ? 'Edit Schedule' : 'Add Schedule'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select 
                  value={formData.className} 
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                  disabled={loading}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id || cls.name} value={cls.name || cls}>
                      {cls.name || cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select 
                  value={formData.day} 
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                  disabled={loading}
                >
                  <option value="">Select Day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teacher</label>
                <select 
                  value={formData.teacherId} 
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Room</label>
                <input 
                  type="text" 
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingEntry ? 'Update' : 'Add')} Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;