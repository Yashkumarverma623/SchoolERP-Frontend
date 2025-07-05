// Attendance Component
import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/attendance?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => setAttendance(data))
      .catch(err => console.error('Error fetching attendance:', err));
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Attendance Management</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((record) => (
          <div key={record._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{record.className}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
    </div>
  );
};


export default AttendanceManagement;