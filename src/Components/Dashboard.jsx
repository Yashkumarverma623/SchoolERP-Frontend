import { Users, Calendar, BookOpen, CreditCard, FileText, MessageSquare, PenTool, BarChart3, Bell, Menu, X, TrendingUp, AlertCircle, CheckCircle, Clock, User, DollarSign } from 'lucide-react';
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [feeOverview, setFeeOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const statsRes = await fetch(`${API_BASE_URL}/dashboard/stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        const activitiesRes = await fetch(`${API_BASE_URL}/dashboard/activities?limit=10`);
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);

        const attendanceRes = await fetch(`${API_BASE_URL}/dashboard/attendance-overview?days=7`);
        const attendanceData = await attendanceRes.json();
        setAttendanceOverview(attendanceData);

        const feeRes = await fetch(`${API_BASE_URL}/dashboard/fee-overview`);
        const feeData = await feeRes.json();
        setFeeOverview(feeData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'attendance':
        return 'text-green-600 bg-green-50';
      case 'payment':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your school today.</p>
        </div>

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
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.pendingFees || 0)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate || 0}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentToday || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentToday || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalFeesAmount || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fees
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {activities.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.date)} • {activity.class}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.classDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ className, count }) => `${className}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(stats.classDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Fee Collection</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyFeeCollection || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                    <Bar dataKey="amount" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceOverview}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Average Attendance</p>
                    <p className="text-2xl font-bold text-green-700">{stats.attendanceRate || 0}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Today Present</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.presentToday || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Today Absent</p>
                    <p className="text-2xl font-bold text-red-700">{stats.absentToday || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Fees</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.totalFeesAmount || 0)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Paid Fees</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.paidFeesAmount || 0)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Pending Fees</p>
                    <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.pendingFees || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Overdue Fees</p>
                    <p className="text-2xl font-bold text-red-700">{stats.overdueFeesCount || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Fee Overview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeOverview.map((classData, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {classData.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(classData.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(classData.paidAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                          {formatCurrency(classData.pendingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${classData.collectionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{classData.collectionPercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {stats.recentNotices && stats.recentNotices.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notices</h3>
            <div className="space-y-3">
              {stats.recentNotices.map((notice, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notice.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notice.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};  

export default Dashboard;