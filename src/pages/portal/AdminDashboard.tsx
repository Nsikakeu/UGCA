import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, BookOpen, Calendar, Settings, LogOut, Lock, GraduationCap, School, Book, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ students: 0, classes: 0, subjects: 0 });
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);
  const navigate = useNavigate();

  const [editingStudent, setEditingStudent] = useState<any>(null);

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

  // Score Entry State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scores, setScores] = useState({ ca1: '', ca2: '', ca3: '', exam: '', total: '', grade: '', remark: '', position: '' });

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
          session_id: 1, // Hardcoded for demo, ideally should use current session
          term_id: 1,    // Hardcoded for demo
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

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Notification State
  const [notification, setNotification] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSetNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: notification, is_active: isActive })
      });
      if (res.ok) {
        alert('Notification updated successfully');
        setNotification('');
      } else {
        alert('Failed to update notification');
      }
    } catch (e) {
      alert('Error updating notification');
    }
  };

  const fetchData = () => {
    Promise.all([
      fetch('/api/students').then(res => res.json()),
      fetch('/api/classes').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/sessions').then(res => res.json()),
      fetch('/api/terms').then(res => res.json())
    ]).then(([students, classes, subjects, sessions, terms]) => {
      setStudentsList(students);
      setClassesList(classes);
      setSubjectsList(subjects);
      setSessionsList(sessions);
      setTermsList(terms);
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
      .then(data => {
        if (data.user.role !== 'admin' && data.user.role !== 'super-admin') {
           navigate('/portal');
           return;
        }
        setUser(data.user);
      })
      .catch(() => navigate('/portal'));

    fetchData();
  }, [navigate]);

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

  const handleSetCurrent = async (endpoint: string, id: number) => {
    try {
      const res = await fetch(`/api/${endpoint}/${id}/current`, { method: 'PUT' });
      if (res.ok) {
        alert('Updated successfully');
        fetchData();
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      alert('Error updating item');
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
          <h2 className="font-serif text-xl font-bold text-gold-500">Admin Portal</h2>
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
            onClick={() => setActiveTab('scores')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scores' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileText size={20} /> Scores Entry
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <Settings size={20} /> Settings
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-gold-500 text-navy-900 font-medium' : 'hover:bg-white/10 text-slate-300'}`}
          >
            <FileText size={20} /> Notifications
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-2xl">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Manage Student Notifications</h3>
              <form onSubmit={handleSetNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notification Message</label>
                  <textarea
                    value={notification}
                    onChange={(e) => setNotification(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none h-32"
                    placeholder="Enter notification text here..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">This message will scroll at the top of the student dashboard.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-gold-500 border-slate-300 rounded focus:ring-gold-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-700">Set as Active Notification</label>
                </div>
                <button type="submit" className="bg-navy-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors">
                  Update Notification
                </button>
              </form>
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
                    <li key={session.id} className={`flex justify-between items-center p-3 rounded-lg border ${session.is_current ? 'bg-gold-50 border-gold-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-navy-900">{session.name}</span>
                        {session.is_current && <span className="text-xs bg-gold-500 text-navy-900 px-2 py-1 rounded-full font-bold">Current</span>}
                      </div>
                      <div className="flex gap-2">
                        {!session.is_current && (
                          <button onClick={() => handleSetCurrent('sessions', session.id)} className="text-navy-600 hover:text-navy-800 text-sm font-medium">Set Current</button>
                        )}
                        <button onClick={() => handleDelete('sessions', session.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </div>
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
                    <li key={term.id} className={`flex justify-between items-center p-3 rounded-lg border ${term.is_current ? 'bg-gold-50 border-gold-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-navy-900">{term.name}</span>
                        {term.is_current && <span className="text-xs bg-gold-500 text-navy-900 px-2 py-1 rounded-full font-bold">Current</span>}
                      </div>
                      <div className="flex gap-2">
                        {!term.is_current && (
                          <button onClick={() => handleSetCurrent('terms', term.id)} className="text-navy-600 hover:text-navy-800 text-sm font-medium">Set Current</button>
                        )}
                        <button onClick={() => handleDelete('terms', term.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
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
