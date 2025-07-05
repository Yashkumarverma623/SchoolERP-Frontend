// Notice Board Component
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
import { useEffect, useState } from "react";
const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/notices`)
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(err => console.error('Error fetching notices:', err));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Notice Board</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Notice
        </button>
      </div>
      
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-lg">{notice.title}</h4>
              <span className="text-sm text-gray-500">{notice.date}</span>
            </div>
            <p className="text-gray-700 mb-2">{notice.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">By: {notice.author}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                notice.priority === 'high' ? 'bg-red-100 text-red-800' : 
                notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {notice.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;