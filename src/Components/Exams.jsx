import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  
  const [examForm, setExamForm] = useState({
    name: '',
    subject: '',
    class: '',
    date: '',
    maxMarks: '',
    duration: '',
    description: ''
  });

  const [resultForm, setResultForm] = useState({
    studentId: '',
    examId: '',
    marksObtained: '',
    maxMarks: '',
    grade: '',
    remarks: ''
  });

  const fetchData = async () => {
    try {
      const [examsRes, resultsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/exams`),
        fetch(`${API_BASE_URL}/exams/results/all`),
        fetch(`${API_BASE_URL}/students`)
      ]);
      
      const [examsData, resultsData, studentsData] = await Promise.all([
        examsRes.json(),
        resultsRes.json(),
        studentsRes.json()
      ]);
      
      setExams(examsData);
      setResults(resultsData);
      setStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExamSubmit = async () => {
    try {
      const url = editingExam 
        ? `${API_BASE_URL}/exams/${editingExam._id}`
        : `${API_BASE_URL}/exams`;
      
      const method = editingExam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examForm),
      });

      if (response.ok) {
        fetchData();
        setShowModal(false);
        setEditingExam(null);
        setExamForm({
          name: '',
          subject: '',
          class: '',
          date: '',
          maxMarks: '',
          duration: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleResultSubmit = async () => {
    try {
      const url = editingResult 
        ? `${API_BASE_URL}/exams/results/${editingResult._id}`
        : `${API_BASE_URL}/exams/results`;
      
      const method = editingResult ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultForm),
      });

      if (response.ok) {
        fetchData();
        setShowResultModal(false);
        setEditingResult(null);
        setResultForm({
          studentId: '',
          examId: '',
          marksObtained: '',
          maxMarks: '',
          grade: '',
          remarks: ''
        });
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const handleDeleteResult = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/results/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name || '',
      subject: exam.subject || '',
      class: exam.class || '',
      date: exam.date ? exam.date.split('T')[0] : '',
      maxMarks: exam.maxMarks || '',
      duration: exam.duration || '',
      description: exam.description || ''
    });
    setShowModal(true);
  };

  const handleEditResult = (result) => {
    setEditingResult(result);
    setResultForm({
      studentId: result.studentId || '',
      examId: result.examId || '',
      marksObtained: result.marksObtained || '',
      maxMarks: result.maxMarks || '',
      grade: result.grade || '',
      remarks: result.remarks || ''
    });
    setShowResultModal(true);
  };

  const generateReportCard = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/report-card/${studentId}`);
      const data = await response.json();
      setReportCard(data);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error generating report card:', error);
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s._id === studentId);
    return student ? student.name : 'Unknown';
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e._id === examId);
    return exam ? exam.name : 'Unknown';
  };

  const calculateGrade = (marksObtained, maxMarks) => {
    const percentage = (marksObtained / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  useEffect(() => {
    if (resultForm.marksObtained && resultForm.maxMarks) {
      const grade = calculateGrade(Number(resultForm.marksObtained), Number(resultForm.maxMarks));
      setResultForm(prev => ({ ...prev, grade }));
    }
  }, [resultForm.marksObtained, resultForm.maxMarks]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Exam Management & Report Cards</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'exams' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Results
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Report Cards
          </button>
        </div>
      </div>

      {activeTab === 'exams' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">Exams</h4>
            <button
              onClick={() => {
                setEditingExam(null);
                setExamForm({
                  name: '',
                  subject: '',
                  class: '',
                  date: '',
                  maxMarks: '',
                  duration: '',
                  description: ''
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Exam
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.date ? new Date(exam.date).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.maxMarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.duration}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
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
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">Results</h4>
            <button
              onClick={() => {
                setEditingResult(null);
                setResultForm({
                  studentId: '',
                  examId: '',
                  marksObtained: '',
                  maxMarks: '',
                  grade: '',
                  remarks: ''
                });
                setShowResultModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Result
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{getStudentName(result.studentId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getExamName(result.examId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.marksObtained}/{result.maxMarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.grade}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{((result.marksObtained / result.maxMarks) * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEditResult(result)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result._id)}
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
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h4 className="text-md font-medium mb-4">Generate Report Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student._id} className="border rounded-lg p-4 hover:shadow-md">
                <h5 className="font-medium text-gray-900">{student.name}</h5>
                <p className="text-sm text-gray-600">Class: {student.class}</p>
                <p className="text-sm text-gray-600">Roll No: {student.rollNo}</p>
                <button
                  onClick={() => generateReportCard(student._id)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Generate Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingExam ? 'Edit Exam' : 'Add New Exam'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={examForm.subject}
                  onChange={(e) => setExamForm({...examForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={examForm.class}
                  onChange={(e) => setExamForm({...examForm, class: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({...examForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={examForm.maxMarks}
                  onChange={(e) => setExamForm({...examForm, maxMarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={examForm.duration}
                  onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                  placeholder="e.g., 2 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExamSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingExam ? 'Update' : 'Add'} Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">
              {editingResult ? 'Edit Result' : 'Add New Result'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={resultForm.studentId}
                  onChange={(e) => setResultForm({...resultForm, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select
                  value={resultForm.examId}
                  onChange={(e) => {
                    const selectedExam = exams.find(exam => exam._id === e.target.value);
                    setResultForm({
                      ...resultForm, 
                      examId: e.target.value,
                      maxMarks: selectedExam ? selectedExam.maxMarks : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Exam</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.name} - {exam.subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  value={resultForm.marksObtained}
                  onChange={(e) => setResultForm({...resultForm, marksObtained: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  value={resultForm.maxMarks}
                  onChange={(e) => setResultForm({...resultForm, maxMarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  value={resultForm.grade}
                  onChange={(e) => setResultForm({...resultForm, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({...resultForm, remarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResultSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingResult ? 'Update' : 'Add'} Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {showReportModal && reportCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Report Card</h4>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <h5 className="text-lg font-medium">{reportCard.student.name}</h5>
              <p className="text-sm text-gray-600">Class: {reportCard.student.class}</p>
              <p className="text-sm text-gray-600">Roll No: {reportCard.student.rollNo}</p>
            </div>

            <div className="mb-6">
              <h6 className="font-medium mb-2">Exam Results</h6>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportCard.results.map((result) => (
                      <tr key={result._id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{result.exam.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{result.exam.subject}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{result.marksObtained}/{result.maxMarks}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{result.grade}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{((result.marksObtained / result.maxMarks) * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-medium mb-2">Summary</h6>
              <p className="text-sm text-gray-600">Total Marks: {reportCard.totalMarks}/{reportCard.totalMaxMarks}</p>
              <p className="text-sm text-gray-600">Average Percentage: {reportCard.averagePercentage}%</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
              >
                Print Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;