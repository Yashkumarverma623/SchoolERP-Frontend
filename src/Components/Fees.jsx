import { useEffect, useState } from "react";
import { Plus, Search, Filter, DollarSign, Calendar, Users, AlertCircle, Check, X, Edit, Trash2, Receipt, RefreshCw } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1573';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalFees: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    className: '',
    studentId: ''
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    className: '',
    description: '',
    feeType: 'tuition'
  });

  useEffect(() => {
    fetchFees();
    fetchStats();
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fees, filters]); 

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/fees`);
      if (!response.ok) throw new Error('Failed to fetch fees');
      const data = await response.json();
      setFees(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fees/stats/summary`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats({
        totalFees: data.totalFees || 0,
        totalAmount: data.totalAmount || 0,
        paidAmount: data.paidAmount || 0,
        overdueFees: data.overdueFees || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...fees];
    
    if (filters.status) {
      filtered = filtered.filter(fee => fee.status === filters.status);
    }
    
    if (filters.className) {
      filtered = filtered.filter(fee => 
        fee.className && fee.className.toLowerCase().includes(filters.className.toLowerCase())
      );
    }
    
    if (filters.studentId) {
      filtered = filtered.filter(fee => 
        (fee.studentData?.name && fee.studentData.name.toLowerCase().includes(filters.studentId.toLowerCase())) ||
        (fee.studentData?.rollNo && fee.studentData.rollNo.toLowerCase().includes(filters.studentId.toLowerCase()))
      );
    }
    
    setFilteredFees(filtered);
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add fee');
      }
      
      await fetchFees();
      await fetchStats();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditFee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/fees/${selectedFee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to update fee');
      
      await fetchFees();
      await fetchStats();
      setShowEditModal(false);
      setSelectedFee(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

const handleStatusToggle = async (feeId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    const currentFee = fees.find(fee => fee._id === feeId);
    if (!currentFee) {
      throw new Error('Fee not found in local state');
    }
    
    console.log('Updating fee status:', feeId, 'from', currentStatus, 'to', newStatus);
    
    const response = await fetch(`${API_BASE_URL}/fees/${feeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: currentFee.studentId,
        amount: currentFee.amount,
        dueDate: currentFee.dueDate,
        className: currentFee.className,
        description: currentFee.description || '',
        feeType: currentFee.feeType || 'tuition',
        status: newStatus,
        ...(newStatus === 'paid' && {
          paidDate: new Date().toISOString(),
          paymentMethod: 'manual', 
          paidAmount: currentFee.amount
        })
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || errorData.message || 'Failed to update status');
    }
    
    const updatedFee = await response.json();
    console.log('Updated fee:', updatedFee);
    
    setFees(prevFees => 
      prevFees.map(fee => 
        fee._id === feeId 
          ? { ...fee, ...updatedFee }
          : fee
      )
    );
    
    await fetchStats();
    
  } catch (err) {
    console.error('Error updating status:', err);
    setError(err.message);
  }
};

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/fees/${feeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete fee');
      
      await fetchFees();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      dueDate: '',
      className: '',
      description: '',
      feeType: 'tuition'
    });
  };

  const handleStudentSelect = (studentId) => {
    const selectedStudent = students.find(student => student._id === studentId);
    setFormData({
      ...formData, 
      studentId: studentId,
      className: selectedStudent ? selectedStudent.class : ''
    });
  };

  const openEditModal = (fee) => {
    setSelectedFee(fee);
    setFormData({
      studentId: fee.studentId || '',
      amount: fee.amount || '',
      dueDate: fee.dueDate ? fee.dueDate.split('T')[0] : '',
      className: fee.className || '',
      description: fee.description || '',
      feeType: fee.feeType || 'tuition'
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch  {
      return 'Invalid Date';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status !== 'pending') return false;
    try {
      return new Date(dueDate) < new Date();
    } catch  {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.paidAmount.toLocaleString()}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueFees}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Fee Management</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Fee
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by class..."
              value={filters.className}
              onChange={(e) => setFilters({...filters, className: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student..."
              value={filters.studentId}
              onChange={(e) => setFilters({...filters, studentId: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{fee.studentData?.name || 'N/A'}</div>
                      <div className="text-gray-500">{fee.studentData?.rollNo || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{fee.className || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{fee.amount ? fee.amount.toLocaleString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className={isOverdue(fee.dueDate, fee.status) ? 'text-red-600' : ''}>
                      {formatDate(fee.dueDate)}
                      {isOverdue(fee.dueDate, fee.status) && (
                        <span className="ml-1 text-xs">(Overdue)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      fee.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : isOverdue(fee.dueDate, fee.status)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fee.status === 'paid' ? 'Paid' : isOverdue(fee.dueDate, fee.status) ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusToggle(fee._id, fee.status)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {fee.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}
                      </button>
                      <button 
                        onClick={() => openEditModal(fee)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteFee(fee._id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No fee records found
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Fee</h3>
            <form onSubmit={handleAddFee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.rollNo}) - Class {student.class}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  disabled={!!formData.studentId}
                  placeholder={formData.studentId ? "Auto-filled from student" : "Enter class"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                <select
                  value={formData.feeType}
                  onChange={(e) => setFormData({...formData, feeType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="tuition">Tuition</option>
                  <option value="transport">Transport</option>
                  <option value="library">Library</option>
                  <option value="examination">Examination</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Fee</h3>
            <form onSubmit={handleEditFee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.rollNo}) - Class {student.class}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                <select
                  value={formData.feeType}
                  onChange={(e) => setFormData({...formData, feeType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="tuition">Tuition</option>
                  <option value="transport">Transport</option>
                  <option value="library">Library</option>
                  <option value="examination">Examination</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFee(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;