import { Users, Calendar, BookOpen, CreditCard, FileText, MessageSquare, PenTool, BarChart3, Bell, Menu, X } from 'lucide-react';
import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const Dashboard = () => {
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Total Students</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalStudents || 0}</p>
          </div>
          <Users className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Total Staff</p>
            <p className="text-2xl font-bold text-green-700">{stats.totalStaff || 0}</p>
          </div>
          <Users className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Classes</p>
            <p className="text-2xl font-bold text-purple-700">{stats.totalClasses || 0}</p>
          </div>
          <BookOpen className="h-8 w-8 text-purple-600" />
        </div>
      </div>
      
      <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-600 text-sm font-medium">Pending Fees</p>
            <p className="text-2xl font-bold text-orange-700">₹{stats.pendingFees || 0}</p>
          </div>
          <CreditCard className="h-8 w-8 text-orange-600" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;