import React, { useState, lazy } from 'react';

import { Users, Calendar, BookOpen, CreditCard, FileText, MessageSquare, PenTool, BarChart3, Bell, Menu, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const Dashboard = lazy(() => import('./Dashboard.jsx'));
const StudentManagement = lazy(() => import('./Students.jsx'));
const AttendanceManagement = lazy(() => import('./Attendence.jsx'));
const TimetableManagement = lazy(() => import('./Timetable.jsx'));
const FeeManagement = lazy(() => import('./Fees.jsx'));
const NoticeBoard = lazy(() => import('./NoticeBoard.jsx'));


const ERP = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'timetable', label: 'Timetable', icon: BookOpen },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'notices', label: 'Notice Board', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'timetable':
        return <TimetableManagement />;
      case 'fees':
        return <FeeManagement />;
      case 'notices':
        return <NoticeBoard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-md"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">School ERP</h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="lg:ml-64">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ERP;