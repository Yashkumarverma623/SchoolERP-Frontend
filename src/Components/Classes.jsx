import React, { useState, useEffect } from 'react';
import { Plus, Save, X, AlertCircle, CheckCircle, Edit, Trash2, Eye, Users, Calendar, Search, Filter, BookOpen, User } from 'lucide-react';

const ClassManagementSystem = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [currentView, setCurrentView] = useState('list'); 
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classTimetable, setClassTimetable] = useState([]);
  const [classStats, setClassStats] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    description: '',
    classTeacher: '',
    capacity: '',
    room: '',
    academicYear: new Date().getFullYear().toString()
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes`);
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
      setFilteredClasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setClassStudents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchClassTimetable = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/timetable`);
      if (!response.ok) throw new Error('Failed to fetch timetable');
      const data = await response.json();
      setClassTimetable(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchClassStats = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setClassStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, );

  useEffect(() => {
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.description && cls.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterGrade) {
      filtered = filtered.filter(cls => cls.grade === filterGrade);
    }

    if (filterSection) {
      filtered = filtered.filter(cls => cls.section === filterSection);
    }

    setFilteredClasses(filtered);
  }, [classes, searchQuery, filterGrade, filterSection]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Class name is required');
      return false;
    }
    if (!formData.grade.trim()) {
      setError('Grade is required');
      return false;
    }
    if (!formData.section.trim()) {
      setError('Section is required');
      return false;
    }
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
      setError('Capacity must be a positive number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      const url = currentView === 'edit' 
        ? `${API_BASE_URL}/classes/${selectedClass._id}`
        : `${API_BASE_URL}/classes`;
      
      const method = currentView === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${currentView} class`);
      }

      const classData = await response.json();
      setSuccess(`Class "${classData.name}" ${currentView === 'edit' ? 'updated' : 'created'} successfully!`);
      
      resetForm();
      fetchClasses();
      
      setTimeout(() => {
        setCurrentView('list');
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classData) => {
    setSelectedClass(classData);
    setFormData({
      name: classData.name || '',
      grade: classData.grade || '',
      section: classData.section || '',
      description: classData.description || '',
      classTeacher: classData.classTeacher || '',
      capacity: classData.capacity ? classData.capacity.toString() : '',
      room: classData.room || '',
      academicYear: classData.academicYear || new Date().getFullYear().toString()
    });
    setCurrentView('edit');
  };

  const handleView = async (classData) => {
    setSelectedClass(classData);
    setCurrentView('view');
    await fetchClassStudents(classData._id);
    await fetchClassTimetable(classData._id);
    await fetchClassStats(classData._id);
  };

  const handleDelete = async (classData) => {
    if (!confirm(`Are you sure you want to delete class "${classData.name}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classData._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete class');

      setSuccess(`Class "${classData.name}" deleted successfully!`);
      fetchClasses();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      section: '',
      description: '',
      classTeacher: '',
      capacity: '',
      room: '',
      academicYear: new Date().getFullYear().toString()
    });
    setError('');
    setSuccess('');
    setSelectedClass(null);
  };

  const getUniqueGrades = () => {
    return [...new Set(classes.map(cls => cls.grade))].sort();
  };

  const getUniqueSections = () => {
    return [...new Set(classes.map(cls => cls.section))].sort();
  };

  const ListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Class Management</h1>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Create New Class
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Grades</option>
            {getUniqueGrades().map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sections</option>
            {getUniqueSections().map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(classData => (
          <div key={classData._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{classData.name}</h3>
                <p className="text-gray-600">Grade {classData.grade} - Section {classData.section}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(classData)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(classData)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Edit Class"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(classData)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Class"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              {classData.room && (
                <p><strong>Room:</strong> {classData.room}</p>
              )}
              {classData.capacity && (
                <p><strong>Capacity:</strong> {classData.capacity}</p>
              )}
              {classData.classTeacher && (
                <p><strong>Teacher:</strong> {classData.classTeacher}</p>
              )}
              {classData.description && (
                <p><strong>Description:</strong> {classData.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No classes found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const FormView = () => (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {currentView === 'edit' ? <Edit size={24} /> : <Plus size={24} />}
          {currentView === 'edit' ? 'Edit Class' : 'Create New Class'}
        </h2>
        <button
          onClick={() => setCurrentView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Grade 5-A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              placeholder="e.g., 5, 10, 12"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              placeholder="e.g., A, B, C"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="e.g., 101, A-201"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              id="academicYear"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="classTeacher" className="block text-sm font-medium text-gray-700 mb-1">
            Class Teacher ID
          </label>
          <input
            type="text"
            id="classTeacher"
            name="classTeacher"
            value={formData.classTeacher}
            onChange={handleInputChange}
            placeholder="Teacher ID (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Additional information about the class..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? (currentView === 'edit' ? 'Updating...' : 'Creating...') : (currentView === 'edit' ? 'Update Class' : 'Create Class')}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <X size={20} />
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );

  const DetailView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Class Details</h2>
        <button
          onClick={() => setCurrentView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedClass.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Grade:</strong> {selectedClass.grade}</div>
          <div><strong>Section:</strong> {selectedClass.section}</div>
          <div><strong>Room:</strong> {selectedClass.room || 'Not assigned'}</div>
          <div><strong>Capacity:</strong> {selectedClass.capacity || 'Not specified'}</div>
          <div><strong>Class Teacher:</strong> {selectedClass.classTeacher || 'Not assigned'}</div>
          <div><strong>Academic Year:</strong> {selectedClass.academicYear}</div>
        </div>
        {selectedClass.description && (
          <div className="mt-4">
            <strong>Description:</strong> {selectedClass.description}
          </div>
        )}
      </div>

      {classStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users size={20} />
              <h4 className="font-semibold">Students</h4>
            </div>
            <p className="text-2xl font-bold text-blue-800">{classStats.totalStudents}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Calendar size={20} />
              <h4 className="font-semibold">Schedules</h4>
            </div>
            <p className="text-2xl font-bold text-green-800">{classStats.totalSchedules}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <BookOpen size={20} />
              <h4 className="font-semibold">Grade</h4>
            </div>
            <p className="text-2xl font-bold text-purple-800">{classStats.grade}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Students ({classStudents.length})
        </h4>
        {classStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classStudents.map(student => (
              <div key={student._id} className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-600">ID: {student.studentId}</div>
                {student.email && <div className="text-sm text-gray-600">Email: {student.email}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No students enrolled in this class</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Timetable ({classTimetable.length})
        </h4>
        {classTimetable.length > 0 ? (
          <div className="space-y-3">
            {classTimetable.map(schedule => (
              <div key={schedule._id} className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{schedule.subject}</div>
                <div className="text-sm text-gray-600">
                  {schedule.day} - {schedule.startTime} to {schedule.endTime}
                </div>
                {schedule.teacher && <div className="text-sm text-gray-600">Teacher: {schedule.teacher}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No timetable scheduled for this class</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {currentView === 'list' && <ListView />}
      {(currentView === 'create' || currentView === 'edit') && <FormView />}
      {currentView === 'view' && <DetailView />}
    </div>
  );
};

export default ClassManagementSystem;