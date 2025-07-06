import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1573';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    department: '',
    subjects: '',
    phone: '',
    qualification: ''
  });

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers`);
      const data = await response.json();
      setTeachers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s)
      };

      const url = editingTeacher 
        ? `${API_BASE_URL}/teachers/${editingTeacher._id}`
        : `${API_BASE_URL}/teachers`;
      
      const method = editingTeacher ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        fetchTeachers();
        setShowModal(false);
        setEditingTeacher(null);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          employeeId: '',
          department: '',
          subjects: '',
          phone: '',
          qualification: ''
        });
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      employeeId: teacher.employeeId || '',
      department: teacher.department || '',
      subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
      phone: teacher.phone || '',
      qualification: teacher.qualification || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTeachers();
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingTeacher(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      department: '',
      subjects: '',
      phone: '',
      qualification: ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-8">Loading teachers...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Teacher Management</h3>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Teacher
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{teacher.employeeId}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{teacher.department}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {teacher.subjects ? teacher.subjects.join(', ') : ''}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{teacher.email}</td>
                <td className="px-4 py-3 text-sm">
                  <button 
                    onClick={() => handleEdit(teacher)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(teacher._id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h4>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects (comma separated)
                </label>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  placeholder="Math, Science, English"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTeacher ? 'Update' : 'Add'} Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersManagement;