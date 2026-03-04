import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, BookOpen, Calendar, Settings, LogOut, Lock, UserPlus, GraduationCap, School, Book, FileText, MessageSquare, FileMinus, Trash2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ students: 0, classes: 0, subjects: 0 });
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [admissionsList, setAdmissionsList] = useState<any[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const navigate = useNavigate();

  // Result History State
  const [resultHistoryClass, setResultHistoryClass] = useState('');
  const [resultHistoryTerm, setResultHistoryTerm] = useState('');
  const [resultHistoryList, setResultHistoryList] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Score Entry State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scores, setScores] = useState({ ca1: '', ca2: '', ca3: '', exam: '', total: '', grade: '', remark: '', position: '' });

  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchResultHistory = async () => {
    if (!resultHistoryClass || !selectedSession || !resultHistoryTerm) {
      alert('Please select class, session and term');
      return;
    }
    
    setIsFetchingHistory(true);
    setResultHistoryList([]); // Clear list to show loading state
    try {
      const res = await fetch(`/api/results/students/${resultHistoryClass}/${selectedSession}/${resultHistoryTerm}`);
      if (res.ok) {
        const data = await res.json();
        setResultHistoryList(Array.isArray(data) ? data : []);
      } else {
        alert('Failed to fetch result history');
      }
    } catch (e) {
      alert('Error fetching result history');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleDeleteResult = async (studentId: number) => {
    const student = resultHistoryList.find((s: any) => s.id === studentId);
    const sessionName = sessionsList.find((s: any) => s.id == selectedSession)?.name;
    const termName = termsList.find((t: any) => t.id == resultHistoryTerm)?.name;

    if (!confirm(`Are you sure you want to delete result for ${student?.name} (${student?.admission_number}) in ${sessionName} - ${termName}? This action cannot be undone.`)) return;
    
    try {
      console.log(`Deleting result for student ${studentId}, session ${selectedSession}, term ${resultHistoryTerm}`);
      const res = await fetch(`/api/results/${studentId}/${selectedSession}/${resultHistoryTerm}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('Result deleted successfully');
        fetchResultHistory(); // Refresh list
      } else {
        const data = await res.json();
        alert('Failed to delete result: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Error deleting result:', e);
      alert('Error deleting result');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const role = formData.get('role') as string;
    const assigned_class_id = formData.get('assigned_class_id') as string;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, role, assigned_class_id: assigned_class_id || null })
      });
      
      if (res.ok) {
        alert('User updated successfully');
        setEditingUser(null);
        fetchData();
      } else {
        const data = await res.json();
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      alert('Error updating user');
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
          session_id: selectedSession || 1, // Use selected session or default
          term_id: 1,    // Hardcoded for demo, ideally should be selectable
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

  const handleSetCurrentSession = async (id: number) => {
    try {
      const res = await fetch(`/api/sessions/${id}/current`, { method: 'PUT' });
      if (res.ok) {
        alert('Session set as current');
        fetchData();
      } else {
        alert('Failed to set session');
      }
    } catch (e) {
      alert('Error setting session');
    }
  };

  const handleSetCurrentTerm = async (id: number) => {
    try {
      const res = await fetch(`/api/terms/${id}/current`, { method: 'PUT' });
      if (res.ok) {
        alert('Term set as current');
        fetchData();
      } else {
        alert('Failed to set term');
      }
    } catch (e) {
      alert('Error setting term');
    }
  };

  const fetchData = () => {
    Promise.all([
      fetch('/api/students').then(res => res.json()),
      fetch('/api/classes').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/sessions').then(res => res.json()),
      fetch('/api/terms').then(res => res.json()),
      fetch('/api/users').then(res => res.json()),
      fetch('/api/admissions').then(res => res.json()),
      fetch('/api/enquiries').then(res => res.json())
    ]).then(([students, classes, subjects, sessions, terms, users, admissions, enquiries]) => {
      setStudentsList(students);
      setClassesList(classes);
      setSubjectsList(subjects);
      setSessionsList(sessions);
      
      // Set default selected session to current
      const currentSession = Array.isArray(sessions) ? sessions.find((s: any) => s.is_current) : null;
      if (currentSession && !selectedSession) setSelectedSession(currentSession.id);
      
      setTermsList(terms);
      setUsersList(Array.isArray(users) ? users : []);
      setAdmissionsList(Array.isArray(admissions) ? admissions : []);
      setEnquiriesList(Array.isArray(enquiries) ? enquiries : []);
      setStats({
        students: Array.isArray(students) ? students.length : 0,
        classes: Array.isArray(classes) ? classes.length : 0,
        subjects: Array.isArray(subjects) ? subjects.length : 0
      });
    }).catch(console.error);
  };

  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => setUser(data.user))
      .catch(() => navigate('/portal'));

    fetchData();
  }, [navigate]);

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
          fetchData();
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

  const handleDelete = async (endpoint: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Error deleting item');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/portal');
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-navy-900 text-white fixed h-full overflow-y-auto hidden md:block">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-serif text-xl font-bold text-gold-500">Super Admin</h2>
          <p className="text-xs text-slate-400 mt-1">School Management</p>
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
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Users size={20} /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <GraduationCap size={20} /> Students
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'classes' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <School size={20} /> Classes
          </button>
          <button 
            onClick={() => setActiveTab('subjects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'subjects' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Book size={20} /> Subjects
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'sessions' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Calendar size={20} /> Sessions & Terms
          </button>
          <button 
            onClick={() => setActiveTab('admissions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admissions' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileText size={20} /> Admissions
          </button>
          <button 
            onClick={() => setActiveTab('enquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'enquiries' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <MessageSquare size={20} /> Enquiries
          </button>
          <button 
            onClick={() => setActiveTab('scores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scores' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileText size={20} /> Scores Entry
          </button>
          <button 
            onClick={() => setActiveTab('result-history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'result-history' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileMinus size={20} /> Result History
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
          <h1 className="text-2xl font-bold text-navy-900 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none bg-white text-sm"
            >
              <option value="">Select Session</option>
              {sessionsList.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Current)' : ''}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 font-bold">
                {user.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.students}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium mb-2">Total Classes</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.classes}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium mb-2">Total Subjects</h3>
                <p className="text-3xl font-bold text-navy-900">{stats.subjects}</p>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-8">
              {/* Sessions Management */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Academic Sessions</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const name = formData.get('name') as string;
                  fetch('/api/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                  }).then(res => res.json()).then(data => {
                    if (data.success) { alert('Session added'); form.reset(); fetchData(); }
                    else alert('Failed: ' + data.error);
                  });
                }} className="flex gap-4 mb-8">
                  <input name="name" placeholder="e.g. 2024/2025" required className="flex-1 px-4 py-2 border border-slate-300 rounded-lg" />
                  <button type="submit" className="bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium">Add Session</button>
                </form>
                <p className="text-slate-500 text-sm mb-4">Existing sessions:</p>
                <ul className="space-y-2">
                  {sessionsList.map((session: any) => (
                    <li key={session.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-navy-900">{session.name}</span>
                        {session.is_current ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Current</span>
                        ) : (
                          <button 
                            onClick={() => handleSetCurrentSession(session.id)}
                            className="text-xs text-navy-600 hover:text-navy-800 underline"
                          >
                            Set as Current
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDelete('sessions', session.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Terms Management */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Terms</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const name = formData.get('name') as string;
                  fetch('/api/terms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                  }).then(res => res.json()).then(data => {
                    if (data.success) { alert('Term added'); form.reset(); fetchData(); }
                    else alert('Failed: ' + data.error);
                  });
                }} className="flex gap-4 mb-8">
                  <select name="name" required className="flex-1 px-4 py-2 border border-slate-300 rounded-lg">
                    <option value="">Select Term</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                  <button type="submit" className="bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium">Add Term</button>
                </form>
                <p className="text-slate-500 text-sm mb-4">Existing terms:</p>
                <ul className="space-y-2">
                  {termsList.map((term: any) => (
                    <li key={term.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-navy-900">{term.name}</span>
                        {term.is_current ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Current</span>
                        ) : (
                          <button 
                            onClick={() => handleSetCurrentTerm(term.id)}
                            className="text-xs text-navy-600 hover:text-navy-800 underline"
                          >
                            Set as Current
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDelete('terms', term.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'admissions' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Admission Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-navy-900">Date</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Class</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Gender</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Phone</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissionsList.length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-center text-slate-500">No applications yet.</td></tr>
                    ) : (
                      admissionsList.map((app: any) => (
                        <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{app.fullname}</td>
                          <td className="py-3 px-4 text-slate-700">{app.class_name || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-700">{app.gender}</td>
                          <td className="py-3 px-4 text-slate-700">{app.phone}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => setSelectedAdmission(app)}
                              className="text-navy-600 hover:text-gold-600 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admission Details Modal */}
          {selectedAdmission && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-navy-900">Application Details</h3>
                  <button onClick={() => setSelectedAdmission(null)} className="text-slate-400 hover:text-slate-600">
                    <LogOut size={20} className="rotate-180" />
                  </button>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Header Info */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      {selectedAdmission.passport ? (
                        <img src={selectedAdmission.passport} alt="Passport" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-2xl font-bold text-navy-900">{selectedAdmission.fullname}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Gender</p>
                          <p className="font-medium text-navy-900">{selectedAdmission.gender}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Date of Birth</p>
                          <p className="font-medium text-navy-900">{selectedAdmission.dob}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Phone</p>
                          <p className="font-medium text-navy-900">{selectedAdmission.phone}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Applying For</p>
                          <p className="font-medium text-navy-900">{selectedAdmission.class_name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <UserPlus size={16} /> Personal Info
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-500">Nationality:</span> {selectedAdmission.nationality}</p>
                        <p><span className="text-slate-500">State of Origin:</span> {selectedAdmission.state}</p>
                        <p><span className="text-slate-500">LGA:</span> {selectedAdmission.lga}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <School size={16} /> Previous School
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-500">School:</span> {selectedAdmission.former_school}</p>
                        <p><span className="text-slate-500">Class:</span> {selectedAdmission.former_class}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h5 className="font-bold text-navy-900 mb-2">Residential Address</h5>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                      {selectedAdmission.address}
                    </p>
                  </div>

                  {/* Result Document */}
                  <div>
                    <h5 className="font-bold text-navy-900 mb-3">Previous Result</h5>
                    {selectedAdmission.result ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {selectedAdmission.result.startsWith('data:image') ? (
                          <img src={selectedAdmission.result} alt="Result" className="w-full h-auto" />
                        ) : (
                          <div className="p-8 text-center bg-slate-50">
                            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-600 mb-4">Document available (PDF/Other)</p>
                            <a 
                              href={selectedAdmission.result} 
                              download={`result-${selectedAdmission.fullname.replace(/\s+/g, '-')}`}
                              className="inline-flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors"
                            >
                              Download Result
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No result document uploaded.</p>
                    )}
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                  <button 
                    onClick={() => setSelectedAdmission(null)}
                    className="bg-navy-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enquiries' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Enquiries</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-navy-900">Date</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Email</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Phone</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiriesList.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-slate-500">No enquiries yet.</td></tr>
                    ) : (
                      enquiriesList.map((enq: any) => (
                        <tr key={enq.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700 text-sm">{new Date(enq.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{enq.first_name} {enq.last_name}</td>
                          <td className="py-3 px-4 text-slate-700">{enq.email}</td>
                          <td className="py-3 px-4 text-slate-700">{enq.phone || '-'}</td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={enq.message}>{enq.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                  >
                    <option value="">-- Select Class --</option>
                    {classesList.map((c: any) => (
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
                    {studentsList.filter((s: any) => s.class_id == selectedClass).map((s: any) => (
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
                    {subjectsList.filter((s: any) => s.class_id == selectedClass || !s.class_id).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 outline-none"
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
                      readOnly
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 outline-none"
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

          {activeTab === 'result-history' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Student Result History</h3>
              <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                <h4 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wider">Filter Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    value={resultHistoryClass}
                    onChange={(e) => setResultHistoryClass(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  >
                    <option value="">Select Class</option>
                    {classesList.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select 
                    value={resultHistoryTerm}
                    onChange={(e) => setResultHistoryTerm(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  >
                    <option value="">Select Term</option>
                    {termsList.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={fetchResultHistory}
                    disabled={isFetchingHistory}
                    className="bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
                  >
                    {isFetchingHistory ? 'Fetching...' : 'Fetch Results'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Note: Session is selected from the top bar ({sessionsList.find((s: any) => s.id == selectedSession)?.name || 'None'})
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Admission No</th>
                      <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultHistoryList.length === 0 ? (
                      <tr><td colSpan={3} className="py-8 text-center text-slate-500">No results found for the selected criteria.</td></tr>
                    ) : (
                      resultHistoryList.map((student: any) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-700">{student.name}</td>
                          <td className="py-3 px-4 text-slate-700">{student.admission_number}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleDeleteResult(student.id)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              <Trash2 size={16} /> Delete Result
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                    {activeTab === 'users' && (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Users</h3>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const form = e.target as HTMLFormElement;
                 const formData = new FormData(form);
                 const username = formData.get('username') as string;
                 const name = formData.get('name') as string;
                 const role = formData.get('role') as string;
                 const assigned_class_id = formData.get('assigned_class_id') as string;

                 fetch('/api/users', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ username, name, role, assigned_class_id: assigned_class_id || null })
                 }).then(res => res.json()).then(data => {
                   if (data.success) {
                     alert(`User created! Password: ${data.password}`);
                     form.reset();
                     fetchData();
                   } else {
                     alert('Failed to create user: ' + data.error);
                   }
                 });
               }} className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                 <h4 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wider">Add New User</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input name="name" placeholder="Full Name" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                   <input name="username" placeholder="Username" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                   <select name="role" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" onChange={(e) => {
                     const classSelect = document.getElementById('assigned_class_select');
                     if (classSelect) {
                       if (e.target.value === 'teacher') {
                         classSelect.style.display = 'block';
                       } else {
                         classSelect.style.display = 'none';
                         (classSelect as HTMLSelectElement).value = '';
                       }
                     }
                   }}>
                     <option value="">Select Role</option>
                     <option value="admin">Admin</option>
                     <option value="teacher">Teacher</option>
                     <option value="super-admin">Super Admin</option>
                   </select>
                   <select id="assigned_class_select" name="assigned_class_id" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" style={{display: 'none'}}>
                     <option value="">Assign Class (Teachers Only)</option>
                     {classesList.map((cls: any) => (
                       <option key={cls.id} value={cls.id}>{cls.name}</option>
                     ))}
                   </select>
                 </div>
                 <button type="submit" className="mt-4 bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                   Add User
                 </button>
               </form>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200">
                       <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Username</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Role</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Assigned Class</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Initial Password</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {usersList.map((u: any) => (
                       <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="py-3 px-4 text-slate-700">{u.name}</td>
                         <td className="py-3 px-4 text-slate-700">{u.username}</td>
                         <td className="py-3 px-4 text-slate-700 capitalize">{u.role}</td>
                         <td className="py-3 px-4 text-slate-700">{u.assigned_class_name || '-'}</td>
                         <td className="py-3 px-4 text-slate-500 font-mono text-sm">{u.temp_password || '-'}</td>
                         <td className="py-3 px-4">
                           <button onClick={() => setEditingUser(u)} className="text-blue-500 hover:text-blue-700 text-sm mr-2">Edit</button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Are you sure you want to regenerate the password for this user?')) return;
                                try {
                                  const res = await fetch(`/api/users/${u.id}/regenerate-password`, { method: 'POST' });
                                  const data = await res.json();
                                  if (res.ok) {
                                    alert(`Password regenerated: ${data.password}`);
                                    fetchData();
                                  } else {
                                    alert('Failed: ' + data.error);
                                  }
                                } catch (e) {
                                  alert('Error regenerating password');
                                }
                              }}
                              className="text-amber-600 hover:text-amber-700 text-sm mr-2"
                            >
                              Regen Pass
                            </button>
                           <button onClick={() => handleDelete('users', u.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-navy-900">Edit User</h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                    <LogOut size={20} className="rotate-180" />
                  </button>
                </div>
                <form onSubmit={handleUpdateUser}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input name="name" defaultValue={editingUser.name} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                      <input name="username" defaultValue={editingUser.username} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select name="role" defaultValue={editingUser.role} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" onChange={(e) => {
                        const classSelect = document.getElementById('edit_assigned_class_select');
                        const classLabel = document.getElementById('edit_assigned_class_label');
                        if (classSelect && classLabel) {
                          if (e.target.value === 'teacher') {
                            classSelect.style.display = 'block';
                            classLabel.style.display = 'block';
                          } else {
                            classSelect.style.display = 'none';
                            classLabel.style.display = 'none';
                            (classSelect as HTMLSelectElement).value = '';
                          }
                        }
                      }}>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="super-admin">Super Admin</option>
                      </select>
                    </div>
                    <div id="edit_assigned_class_container">
                       <label id="edit_assigned_class_label" className="block text-sm font-medium text-slate-700 mb-1" style={{display: editingUser.role === 'teacher' ? 'block' : 'none'}}>Assigned Class</label>
                       <select 
                         id="edit_assigned_class_select" 
                         name="assigned_class_id" 
                         defaultValue={editingUser.assigned_class_id || ''} 
                         className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" 
                         style={{display: editingUser.role === 'teacher' ? 'block' : 'none'}}
                       >
                         <option value="">Assign Class (Teachers Only)</option>
                         {classesList.map((cls: any) => (
                           <option key={cls.id} value={cls.id}>{cls.name}</option>
                         ))}
                       </select>
                    </div>
                    <button type="submit" className="w-full bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                      Update User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Students</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const name = formData.get('name') as string;
                const admission_number = formData.get('admission_number') as string;
                const class_id = formData.get('class_id') as string;
                const gender = formData.get('gender') as string;
                
                // Handle file upload
                const fileInput = form.querySelector('input[name="passport"]') as HTMLInputElement;
                const file = fileInput?.files?.[0];

                const submitData = (passportBase64: string | null) => {
                    fetch('/api/students', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, admission_number, class_id, gender, passport: passportBase64 })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        alert(`Student created! PIN: ${data.pin}`);
                        form.reset();
                        fetchData();
                      } else {
                        alert('Failed: ' + data.error);
                      }
                    });
                };

                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        submitData(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                } else {
                    submitData(null);
                }
              }} className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                <h4 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wider">Add New Student</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input name="name" placeholder="Student Name" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                  <input name="admission_number" placeholder="Admission Number" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                  <select name="class_id" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                    <option value="">Select Class</option>
                    {classesList.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <select name="gender" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Passport Photograph</label>
                    <input type="file" name="passport" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"/>
                </div>
                <button type="submit" className="mt-2 bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                  Add Student
                </button>
              </form>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200">
                       <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Admission No</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">PIN</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {studentsList.map((student: any) => (
                       <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="py-3 px-4 text-slate-700">{student.name}</td>
                         <td className="py-3 px-4 text-slate-700">{student.admission_number}</td>
                         <td className="py-3 px-4 text-slate-700 font-mono text-xs">{student.pin}</td>
                         <td className="py-3 px-4">
                           <button onClick={() => setEditingStudent(student)} className="text-blue-500 hover:text-blue-700 text-sm mr-2">Edit</button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Are you sure you want to regenerate the PIN for this student?')) return;
                                try {
                                  const res = await fetch(`/api/students/${student.id}/regenerate-pin`, { method: 'POST' });
                                  const data = await res.json();
                                  if (res.ok) {
                                    alert(`PIN regenerated: ${data.pin}`);
                                    fetchData();
                                  } else {
                                    alert('Failed: ' + data.error);
                                  }
                                } catch (e) {
                                  alert('Error regenerating PIN');
                                }
                              }}
                              className="text-amber-600 hover:text-amber-700 text-sm mr-2"
                            >
                              Regen PIN
                            </button>
                           <button onClick={() => handleDelete('students', student.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
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
                        {classesList.map((cls: any) => (
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

          {activeTab === 'classes' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Classes</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const name = formData.get('name') as string;
                const level = formData.get('level') as string;

                fetch('/api/classes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, level })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    alert('Class created');
                    form.reset();
                    fetchData();
                  } else {
                    alert('Failed: ' + data.error);
                  }
                });
              }} className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                <h4 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wider">Add New Class</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Class Name (e.g. Primary 1)" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                  <select name="level" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                    <option value="">Select Level</option>
                    <option value="creche">Creche</option>
                    <option value="nursery">Nursery</option>
                    <option value="primary">Primary</option>
                  </select>
                </div>
                <button type="submit" className="mt-4 bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                  Add Class
                </button>
              </form>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200">
                       <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Level</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {classesList.map((cls: any) => (
                       <tr key={cls.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="py-3 px-4 text-slate-700">{cls.name}</td>
                         <td className="py-3 px-4 text-slate-700 capitalize">{cls.level}</td>
                         <td className="py-3 px-4">
                           <button onClick={() => handleDelete('classes', cls.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Subjects</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const name = formData.get('name') as string;
                const class_id = formData.get('class_id') as string;

                fetch('/api/subjects', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, class_id: class_id ? parseInt(class_id) : null })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    alert('Subject created');
                    form.reset();
                    fetchData();
                  } else {
                    alert('Failed: ' + data.error);
                  }
                });
              }} className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
                <h4 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wider">Add New Subject</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Subject Name" required className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                  <select name="class_id" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none">
                    <option value="">Select Class (Optional)</option>
                    {classesList.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="mt-4 bg-gold-500 text-navy-900 px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition-colors">
                  Add Subject
                </button>
              </form>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200">
                       <th className="py-3 px-4 font-semibold text-navy-900">Name</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Class ID</th>
                       <th className="py-3 px-4 font-semibold text-navy-900">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {subjectsList.map((subject: any) => (
                       <tr key={subject.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="py-3 px-4 text-slate-700">{subject.name}</td>
                         <td className="py-3 px-4 text-slate-700">{subject.class_id || 'All'}</td>
                         <td className="py-3 px-4">
                           <button onClick={() => handleDelete('subjects', subject.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
