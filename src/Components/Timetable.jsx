
// Timetable Component

import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/timetable`)
      .then(res => res.json())
      .then(data => setTimetable(data))
      .catch(err => console.error('Error fetching timetable:', err));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Timetable Management</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Schedule
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wednesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thursday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Friday</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {timetable.map((slot) => (
              <tr key={slot._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{slot.time}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{slot.monday}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{slot.tuesday}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{slot.wednesday}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{slot.thursday}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{slot.friday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default TimetableManagement;