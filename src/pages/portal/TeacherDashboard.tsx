import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, LogOut, Lock, User, FileText, Settings, Calendar } from 'lucide-react';

const SKILL_CATEGORIES = {
  "PERSONAL DEVELOPMENT": ["Initiative", "Honesty", "Self-Control", "Self-Reliance", "Obedience", "Aesthetic Appreciation"],
  "SENSE OF RESPONSIBILITY": ["Punctuality", "Neatness", "Perseverance", "Attendance", "Creativity", "Organizational Ability"],
  "SOCIAL DEV.": ["Promptness", "Sense of value", "Politeness", "Socialbility", "Consideration for others", "Spirit of Co-operation"],
  "PSYCHOMOTO DEV": ["Reading & Writing", "Verbal Communication", "Sports & Games", "Handling of Tools", "Painting & Drawing", "Musical Skills", "Crafts"]
};

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();

  const [currentSessionId, setCurrentSessionId] = useState<number>(1);
  const [currentTermId, setCurrentTermId] = useState<number>(1);

  // Score Entry State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scores, setScores] = useState({ ca1: '', ca2: '', ca3: '', exam: '', total: '', grade: '', remark: '', position: '' });
  
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Report Card Data State
  const [reportData, setReportData] = useState<{
    teacher_remark: string;
    head_teacher_signature: string;
    skills_ratings: Record<string, number>;
  }>({ 
    teacher_remark: '', 
    head_teacher_signature: '',
    skills_ratings: {} 
  });

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  const fetchAttendanceHistory = useCallback(() => {
    if (attendanceClass) {
      fetch(`/api/attendance-history/${attendanceClass}/${currentSessionId}/${currentTermId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch attendance history');
          return res.json();
        })
        .then(data => setAttendanceHistory(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [attendanceClass, currentSessionId, currentTermId]);

  // Fetch report data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetch(`/api/report-card-data/${selectedStudent}/${currentSessionId}/${currentTermId}`)
        .then(res => {
          if (!res.ok) {
            // If 404 or other error, just return empty object to allow creating new data
            return {}; 
          }
          return res.json();
        })
        .then((data: any) => {
          setReportData({
            teacher_remark: data.teacher_remark || '',
            head_teacher_signature: data.head_teacher_signature || '',
            skills_ratings: data.skills_ratings || {}
          });
        })
        .catch(err => {
          console.error('Error fetching report data:', err);
          setReportData({ teacher_remark: '', head_teacher_signature: '', skills_ratings: {} });
        });
    } else {
      setReportData({ teacher_remark: '', head_teacher_signature: '', skills_ratings: {} });
    }
  }, [selectedStudent, currentSessionId, currentTermId]);

  // Fetch attendance data when class or date changes
  useEffect(() => {
    if (activeTab === 'attendance' && attendanceClass && attendanceDate && viewMode === 'mark') {
      fetch(`/api/attendance/${attendanceClass}/${attendanceDate}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch attendance');
          return res.json();
        })
        .then(data => {
          // Merge with student list to ensure all students are shown
          const classStudents = students.filter(s => s.class_id == attendanceClass);
          const mergedData = classStudents.map(student => {
            const record = Array.isArray(data) ? data.find((d: any) => d.student_id === student.id) : null;
            return {
              student_id: student.id,
              name: student.name,
              admission_number: student.admission_number,
              status: record ? record.status : 'present' // Default to present
            };
          });
          setAttendanceData(mergedData);
        })
        .catch(console.error);
    }
  }, [activeTab, attendanceClass, attendanceDate, students, viewMode]);

  useEffect(() => {
    if (viewMode === 'history' && attendanceClass) {
      fetchAttendanceHistory();
    }
  }, [viewMode, attendanceClass, fetchAttendanceHistory]);

  const handleReportDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch('/api/report-card-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          session_id: currentSessionId,
          term_id: currentTermId,
          teacher_remark: reportData.teacher_remark,
          head_teacher_signature: reportData.head_teacher_signature,
          skills_ratings: reportData.skills_ratings
        })
      });
      
      if (res.ok) {
        alert('Report details saved successfully');
      } else {
        alert('Failed to save report details');
      }
    } catch (e) {
      alert('Error saving report details');
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportData(prev => ({ ...prev, head_teacher_signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceClass) {
      alert('Please select a class');
      return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: attendanceClass,
          session_id: currentSessionId,
          term_id: currentTermId,
          date: attendanceDate,
          records: attendanceData.map(d => ({ student_id: d.student_id, status: d.status }))
        })
      });

      if (res.ok) {
        alert('Attendance saved successfully');
      } else {
        const data = await res.json();
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      alert('Error saving attendance');
    }
  };

  // Auto-calculate Total, Grade, Remark
  useEffect(() => {
    const ca1 = parseFloat(scores.ca1) || 0;
    const ca2 = parseFloat(scores.ca2) || 0;
    const ca3 = parseFloat(scores.ca3) || 0;
    const exam = parseFloat(scores.exam) || 0;
    
    const total = ca1 + ca2 + ca3 + exam;
    let grade = 'F';
    let remark = 'Fail';

    if (total >= 70) { grade = 'A'; remark = 'Excellent'; }
    else if (total >= 60) { grade = 'B'; remark = 'Very Good'; }
    else if (total >= 50) { grade = 'C'; remark = 'Good'; }
    else if (total >= 45) { grade = 'D'; remark = 'Fair'; }
    else if (total >= 40) { grade = 'E'; remark = 'Poor'; }

    setScores(prev => ({
      ...prev,
      total: total > 0 ? total.toString() : '',
      grade: total > 0 ? grade : '',
      remark: total > 0 ? remark : ''
    }));
  }, [scores.ca1, scores.ca2, scores.ca3, scores.exam]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        if (data.user.role !== 'teacher' && data.user.role !== 'admin' && data.user.role !== 'super-admin') {
           navigate('/portal');
           return;
        }
        setUser(data.user);
        // If teacher has assigned class, set it as default for attendance
        if (data.user.assigned_class_id) {
          setAttendanceClass(data.user.assigned_class_id.toString());
          // Also set default class for score entry if teacher
          if (data.user.role === 'teacher') {
            setSelectedClass(data.user.assigned_class_id.toString());
          }
        }
      })
      .catch(() => navigate('/portal'));

    // Fetch data
    Promise.all([
      fetch('/api/students').then(res => res.ok ? res.json() : []),
      fetch('/api/classes').then(res => res.ok ? res.json() : []),
      fetch('/api/subjects').then(res => res.ok ? res.json() : []),
      fetch('/api/sessions').then(res => res.ok ? res.json() : []),
      fetch('/api/terms').then(res => res.ok ? res.json() : [])
    ]).then(([studentsData, classesData, subjectsData, sessionsData, termsData]) => {
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      
      const currSession = Array.isArray(sessionsData) ? sessionsData.find((s: any) => s.is_current) : null;
      if (currSession) setCurrentSessionId(currSession.id);
      
      const currTerm = Array.isArray(termsData) ? termsData.find((t: any) => t.is_current) : null;
      if (currTerm) setCurrentTermId(currTerm.id);
    }).catch(console.error);
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/portal');
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const admission_number = formData.get('admission_number') as string;
    const class_id = formData.get('class_id') as string;
    const gender = formData.get('gender') as string;
    
    const fileInput = form.querySelector('input[name="passport"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    const submitUpdate = async (passportBase64: string | null) => {
      try {
        const payload: any = { name, admission_number, class_id, gender };
        if (passportBase64) payload.passport = passportBase64;
        else if (editingStudent.passport) payload.passport = editingStudent.passport; // Keep existing if not changed

        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          alert('Student updated successfully');
          setEditingStudent(null);
          // Re-fetch students
          fetch('/api/students').then(res => res.json()).then(setStudents);
        } else {
          const data = await res.json();
          alert('Failed: ' + data.error);
        }
      } catch (err) {
        alert('Error updating student');
      }
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => submitUpdate(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      submitUpdate(null);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) {
      alert('Please select student and subject');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          subject_id: selectedSubject,
          session_id: currentSessionId,
          term_id: currentTermId,
          ...scores
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Score saved successfully');
        setScores({ ca1: '', ca2: '', ca3: '', exam: '', total: '', grade: '', remark: '', position: '' });
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      alert('Error saving score');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      const res = await fetch('/api/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMessage(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordMessage('An error occurred');
    }
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_id == selectedClass) 
    : students;

  const filteredSubjects = selectedClass
    ? subjects.filter(s => s.class_id == selectedClass || !s.class_id)
    : subjects;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-navy-900 text-white fixed h-full overflow-y-auto hidden md:block">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-serif text-xl font-bold text-gold-500">Teacher Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Academic Management</p>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors mb-4"
          >
            <LogOut size={20} /> Logout
          </button>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <BookOpen size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <User size={20} /> Students
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Calendar size={20} /> Attendance
          </button>
          <button 
            onClick={() => setActiveTab('scores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scores' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileText size={20} /> Enter Scores
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Settings size={20} /> Settings
          </button>

        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900 capitalize">{activeTab}</h1>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-navy-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-navy-900 mb-4">Welcome, {user.name}</h2>
              <p className="text-slate-600">Use the sidebar to manage student scores and update your profile.</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-navy-900">Attendance</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('mark')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'mark' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Mark Attendance
                  </button>
                  <button 
                    onClick={() => {
                      setViewMode('history');
                      fetchAttendanceHistory();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'history' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    View History
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                  <select 
                    value={attendanceClass}
                    onChange={(e) => setAttendanceClass(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    disabled={user.role === 'teacher' && user.assigned_class_id} // Lock if teacher has assigned class
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {viewMode === 'mark' && (
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input 
                      type="date" 
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {viewMode === 'mark' ? (
                attendanceClass && attendanceData.length > 0 ? (
                  <form onSubmit={handleAttendanceSubmit}>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                            <th className="py-3 px-4 font-semibold text-navy-900">Admission No</th>
                            <th className="py-3 px-4 font-semibold text-navy-900 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((student, index) => (
                            <tr key={student.student_id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-700">{student.name}</td>
                              <td className="py-3 px-4 text-slate-700">{student.admission_number}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name={`status-${student.student_id}`}
                                      checked={student.status === 'present'}
                                      onChange={() => {
                                        const newData = [...attendanceData];
                                        newData[index].status = 'present';
                                        setAttendanceData(newData);
                                      }}
                                      className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-slate-700">Present</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name={`status-${student.student_id}`}
                                      checked={student.status === 'absent'}
                                      onChange={() => {
                                        const newData = [...attendanceData];
                                        newData[index].status = 'absent';
                                        setAttendanceData(newData);
                                      }}
                                      className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-slate-700">Absent</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name={`status-${student.student_id}`}
                                      checked={student.status === 'late'}
                                      onChange={() => {
                                        const newData = [...attendanceData];
                                        newData[index].status = 'late';
                                        setAttendanceData(newData);
                                      }}
                                      className="text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-slate-700">Late</span>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button type="submit" className="bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-md">
                      Save Attendance
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    {attendanceClass ? 'No students found in this class.' : 'Select a class to mark attendance.'}
                  </div>
                )
              ) : (
                // History View
                <div>
                  <div className="flex justify-end mb-4">
                     <button onClick={() => window.print()} className="flex items-center gap-2 text-navy-900 hover:text-navy-700 font-medium">
                       <FileText size={18} /> Print History
                     </button>
                  </div>
                  {attendanceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="py-3 px-4 font-semibold text-navy-900">Date</th>
                            <th className="py-3 px-4 font-semibold text-navy-900 text-center">Present</th>
                            <th className="py-3 px-4 font-semibold text-navy-900 text-center">Absent</th>
                            <th className="py-3 px-4 font-semibold text-navy-900 text-center">Late</th>
                            <th className="py-3 px-4 font-semibold text-navy-900 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceHistory.map((record: any) => (
                            <tr key={record.date} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-700">{new Date(record.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-center text-green-600 font-medium">{record.present_count}</td>
                              <td className="py-3 px-4 text-center text-red-600 font-medium">{record.absent_count}</td>
                              <td className="py-3 px-4 text-center text-yellow-600 font-medium">{record.late_count}</td>
                              <td className="py-3 px-4 text-right">
                                <button 
                                  onClick={() => {
                                    setAttendanceDate(record.date);
                                    setViewMode('mark');
                                  }}
                                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                  View/Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      No attendance history found for this class/session/term.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Students</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Admission No</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Class</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student: any) => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{student.name}</td>
                        <td className="py-3 px-4 text-slate-700">{student.admission_number}</td>
                        <td className="py-3 px-4 text-slate-700">{classes.find(c => c.id == student.class_id)?.name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => setEditingStudent(student)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Edit Student Modal */}
          {editingStudent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-navy-900">Edit Student</h3>
                  <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                    <LogOut size={20} className="rotate-180" />
                  </button>
                </div>
                <form onSubmit={handleUpdateStudent}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input name="name" defaultValue={editingStudent.name} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Admission Number</label>
                      <input name="admission_number" defaultValue={editingStudent.admission_number} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                      <select name="class_id" defaultValue={editingStudent.class_id} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                        <option value="">Select Class</option>
                        {classes.map((cls: any) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select name="gender" defaultValue={editingStudent.gender} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passport Photograph</label>
                      {editingStudent.passport && (
                        <div className="mb-2">
                          <img src={editingStudent.passport} alt="Current Passport" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                          <p className="text-xs text-slate-500 mt-1">Current Passport</p>
                        </div>
                      )}
                      <input type="file" name="passport" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"/>
                      <p className="text-xs text-slate-500 mt-1">Upload new to replace</p>
                    </div>
                    <button type="submit" className="w-full bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                      Update Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Enter Student Scores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    disabled={user.role === 'teacher' && user.assigned_class_id}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
                  <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    disabled={!selectedClass}
                  >
                    <option value="">-- Select Student --</option>
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Subject</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    disabled={!selectedClass}
                  >
                    <option value="">-- Select Subject --</option>
                    {filteredSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedStudent && (
                <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-md font-bold text-navy-900 mb-4">Report Card Details (General)</h4>
                  <form onSubmit={handleReportDataSubmit} className="space-y-4">
                    
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-slate-700 mb-3">Skills Development & Behaviour Attributes</h5>
                      <p className="text-xs text-slate-500 mb-4">Rate the student on a scale of 1-5 (5=Excellent, 1=No Observable Trait)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                          <div key={category} className="bg-white p-4 rounded-lg border border-slate-200">
                            <h6 className="font-bold text-xs text-navy-900 mb-3 border-b border-slate-100 pb-2">{category}</h6>
                            <div className="space-y-3">
                              {skills.map(skill => (
                                <div key={skill} className="flex justify-between items-center gap-2">
                                  <span className="text-xs text-slate-600 font-medium truncate" title={skill}>{skill}</span>
                                  <div className="flex gap-1 shrink-0">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setReportData(prev => ({
                                          ...prev,
                                          skills_ratings: { ...prev.skills_ratings, [skill]: rating }
                                        }))}
                                        className={`w-6 h-6 text-[10px] rounded flex items-center justify-center transition-colors ${
                                          reportData.skills_ratings?.[skill] === rating 
                                            ? 'bg-navy-900 text-white' 
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                      >
                                        {rating}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Class Teacher's General Remark</label>
                      <textarea
                        value={reportData.teacher_remark}
                        onChange={(e) => setReportData({...reportData, teacher_remark: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                        rows={3}
                        placeholder="Enter general remark for the report card..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Upload Head Teacher Signature</label>
                      {reportData.head_teacher_signature && (
                        <div className="mb-2">
                          <img src={reportData.head_teacher_signature} alt="Signature" className="h-16 object-contain border border-slate-200 bg-white" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
                      />
                    </div>
                    <button type="submit" className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Save Report Details
                    </button>
                  </form>
                </div>
              )}

              <form onSubmit={handleSubmitScore} className="border-t border-slate-100 pt-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CA 1 (10)</label>
                    <input
                      type="number"
                      value={scores.ca1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (e.target.value === '' || (val >= 0 && val <= 10)) {
                          setScores({...scores, ca1: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CA 2 (10)</label>
                    <input
                      type="number"
                      value={scores.ca2}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (e.target.value === '' || (val >= 0 && val <= 10)) {
                          setScores({...scores, ca2: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CA 3 (10)</label>
                    <input
                      type="number"
                      value={scores.ca3}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (e.target.value === '' || (val >= 0 && val <= 10)) {
                          setScores({...scores, ca3: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Exam (70)</label>
                    <input
                      type="number"
                      value={scores.exam}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (e.target.value === '' || (val >= 0 && val <= 70)) {
                          setScores({...scores, exam: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      max="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total</label>
                    <input
                      type="text"
                      value={scores.total}
                      readOnly
                      className={`w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 outline-none ${parseFloat(scores.total) < 50 ? 'text-red-600 font-bold' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
                    <input
                      type="text"
                      value={scores.grade}
                      readOnly
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Remark</label>
                    <input
                      type="text"
                      value={scores.remark}
                      onChange={(e) => setScores({...scores, remark: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={scores.position}
                      onChange={(e) => setScores({...scores, position: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-md"
                >
                  Save Score
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Lock size={20} /> Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Update Password
                </button>
                {passwordMessage && (
                  <p className={`text-sm text-center ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordMessage}
                  </p>
                )}
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
