import { useEffect, useState, useCallback } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState([]);
  const [bulkAttendance, setBulkAttendance] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Form states
  const [newAttendance, setNewAttendance] = useState({
    studentId: '',
    className: '',
    status: 'present',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch overview data
  const fetchAttendanceOverview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance?date=${selectedDate}`);
      const data = await response.json();
      setAttendance(data);
    } catch (err) {
      setError('Error fetching attendance overview');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch detailed records
  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedClass) params.append('class', selectedClass);
      
      const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`);
      const data = await response.json();
      setAttendanceRecords(data);
    } catch (err) {
      setError('Error fetching attendance records');
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClass]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('startDate', selectedDate);
        params.append('endDate', selectedDate);
      }
      if (selectedClass) params.append('class', selectedClass);
      
      const response = await fetch(`${API_BASE_URL}/attendance/stats?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Error fetching statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClass]);

  // Fetch students for dropdown
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      const data = await response.json();
      setStudents(data);
      
      // Extract unique classes from students
      const uniqueClasses = [...new Set(data.map(student => student.class).filter(Boolean))];
      setClasses(uniqueClasses);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, []);

  // Mark single attendance
  const markAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAttendance),
      });
      
      if (response.ok) {
        setNewAttendance({
          studentId: '',
          className: '',
          status: 'present',
          date: new Date().toISOString().split('T')[0]
        });
        fetchAttendanceOverview();
        fetchAttendanceRecords();
        setError('');
      } else {
        setError('Error marking attendance');
      }
    } catch (err) {
      setError('Error marking attendance');
      console.error('Error marking attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare bulk attendance for selected class
  const prepareBulkAttendance = async () => {
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }
    
    try {
      const bulkRecords = students
        .filter(student => student.class === selectedClass)
        .map(student => ({
          studentId: student._id,
          className: selectedClass,
          status: 'present',
          date: selectedDate
        }));
      setBulkAttendance(bulkRecords);
      setError('');
    } catch (err) {
      setError('Error preparing bulk attendance');
      console.error('Error preparing bulk attendance:', err);
    }
  };

  // Mark bulk attendance
  const markBulkAttendance = async () => {
    if (bulkAttendance.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords: bulkAttendance }),
      });
      
      if (response.ok) {
        setBulkAttendance([]);
        fetchAttendanceOverview();
        fetchAttendanceRecords();
        setError('');
      } else {
        setError('Error marking bulk attendance');
      }
    } catch (err) {
      setError('Error marking bulk attendance');
      console.error('Error marking bulk attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update attendance
  const updateAttendance = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        fetchAttendanceRecords();
        fetchAttendanceOverview();
        setError('');
      } else {
        setError('Error updating attendance');
      }
    } catch (err) {
      setError('Error updating attendance');
      console.error('Error updating attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete attendance
  const deleteAttendance = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchAttendanceRecords();
        fetchAttendanceOverview();
        setError('');
      } else {
        setError('Error deleting attendance');
      }
    } catch (err) {
      setError('Error deleting attendance');
      console.error('Error deleting attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      searchStudents(query);
    } else {
      setSearchResults([]);
    }
  };

  // Search students
  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching students:', err);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAttendanceOverview();
    } else if (activeTab === 'records') {
      fetchAttendanceRecords();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [selectedDate, selectedClass, activeTab, fetchAttendanceOverview, fetchAttendanceRecords, fetchStats]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Attendance Management</h3>
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {['overview', 'records', 'mark', 'bulk', 'search', 'stats'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.map((record, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{record.className}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  record.attendanceRate >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.attendanceRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Present: {record.present} | Absent: {record.absent}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record._id} className="border-b">
                <td className="px-4 py-2">
                    {record.studentData ? 
                      record.studentData.name || 
                      `${record.studentData.firstName || ''} ${record.studentData.lastName || ''}`.trim() || 
                      'Unknown Student' : 
                      'Unknown Student'
                    }
                  </td>
                  <td className="px-4 py-2">{record.className}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => updateAttendance(record._id, { 
                        status: record.status === 'present' ? 'absent' : 'present' 
                      })}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => deleteAttendance(record._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark Attendance Tab */}
      {activeTab === 'mark' && (
        <form onSubmit={markAttendance} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={newAttendance.className}
              onChange={(e) => {
                const selectedClass = e.target.value;
                setNewAttendance({...newAttendance, className: selectedClass, studentId: ''});
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={newAttendance.studentId}
              onChange={(e) => setNewAttendance({...newAttendance, studentId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Student</option>
              {students
                .filter(student => !newAttendance.className || student.class === newAttendance.className)
                .map(student => (
                <option key={student._id} value={student._id}>
                  {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()} 
                  {student.rollNo ? ` (${student.rollNo})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={newAttendance.status}
              onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={newAttendance.date}
              onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Marking...' : 'Mark Attendance'}
          </button>
        </form>
      )}

      {/* Bulk Attendance Tab */}
      {activeTab === 'bulk' && (
        <div>
          <div className="mb-4">
            <button
              onClick={prepareBulkAttendance}
              disabled={!selectedClass}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              Prepare Bulk Attendance for {selectedClass || 'Selected Class'}
            </button>
          </div>
          
          {bulkAttendance.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">Bulk Attendance ({bulkAttendance.length} students)</h4>
              <div className="max-h-96 overflow-y-auto mb-4">
                {bulkAttendance.map((record, index) => {
                  const student = students.find(s => s._id === record.studentId);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <span>
                        {student ? 
                          student.name || 
                          `${student.firstName || ''} ${student.lastName || ''}`.trim() || 
                          'Unknown Student' : 
                          'Unknown Student'
                        }
                        {student && student.rollNo && ` (${student.rollNo})`}
                      </span>
                      <select
                        value={record.status}
                        onChange={(e) => {
                          const updated = [...bulkAttendance];
                          updated[index].status = e.target.value;
                          setBulkAttendance(updated);
                        }}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={markBulkAttendance}
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark Bulk Attendance'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, roll number, or email..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(student => (
                <div key={student._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                    </h4>
                    <span className="text-sm text-gray-500">{student.class}</span>
                  </div>
                  {student.rollNo && (
                    <p className="text-sm text-gray-600 mb-1">Roll: {student.rollNo}</p>
                  )}
                  {student.email && (
                    <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                  )}
                  <button
                    onClick={() => {
                      setNewAttendance({
                        studentId: student._id,
                        className: student.class,
                        status: 'present',
                        date: selectedDate
                      });
                      setActiveTab('mark');
                    }}
                    className="w-full bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                  >
                    Mark Attendance
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery.length > 2 && searchResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No students found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{stat.className}</h4>
              <div className="text-sm text-gray-600">
                <p>Total Records: {stat.totalRecords}</p>
                <p>Present: {stat.presentCount}</p>
                <p>Absent: {stat.absentCount}</p>
                <p className="font-medium">Attendance Rate: {stat.attendanceRate}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;