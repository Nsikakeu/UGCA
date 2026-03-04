import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, LogOut, User, FileText, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.message) setNotification(data.message);
      })
      .catch(console.error);
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/me');
      if (!meRes.ok) throw new Error('Not authenticated');
      const meData = await meRes.json();
      
      // If not student, redirect
      if (meData.user.role !== 'student') {
        navigate('/portal');
        return;
      }
      setStudent(meData.user);

      const historyRes = await fetch('/api/student/results-history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }

      const attendanceRes = await fetch('/api/student/attendance');
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendanceHistory(attendanceData);
      }

      const sessionsRes = await fetch('/api/sessions');
      if (sessionsRes.ok) setSessions(await sessionsRes.json());

      const termsRes = await fetch('/api/terms');
      if (termsRes.ok) setTerms(await termsRes.json());
    } catch (error) {
      navigate('/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/portal');
  };

  const viewResult = async (sessionId: number, termId: number) => {
    try {
      const res = await fetch(`/api/student/result/${sessionId}/${termId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scores && data.scores.length > 0) {
          setSelectedResult(data);
        } else {
          alert('No result found for the selected session and term.');
        }
      } else {
        alert('Failed to fetch result. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch result', error);
      alert('An error occurred while fetching the result.');
    }
  };

  const handlePrintResult = async () => {
    if (!selectedResult) return;

    // Fetch report data
    let reportData: any = {};
    try {
      const res = await fetch(`/api/report-card-data/${selectedResult.student.id}/${selectedResult.session_id || 1}/${selectedResult.term_id || 1}`);
      if (res.ok) reportData = await res.json();
    } catch (e) {
      console.error(e);
    }

    const doc = new jsPDF();

    // --- Header Design ---
    
    // Logo (Placeholder Circle with Text if no image)
    doc.setFillColor(30, 27, 75); // Navy 900
    doc.circle(15, 15, 8, 'F'); // Smaller and shifted left/up
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("LOGO", 15, 16, { align: "center" });

    // School Name (Top)
    doc.setTextColor(30, 27, 75); // Navy 900
    doc.setFontSize(22); 
    doc.setFont("helvetica", "bold");
    doc.text("UYO GOLDEN CITY ACADEMY", 105, 18, { align: "center" });

    // Motto (Below School Name)
    doc.setTextColor(100); // Grey
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text('"Competence and Character"', 105, 24, { align: "center" });
    
    // Subtitles
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("STUDENT RESULT SHEET", 105, 32, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${selectedResult.session} ACADEMIC SESSION - ${selectedResult.term.toUpperCase()}`, 105, 38, { align: "center" });

    // Divider Line
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    // Student Passport (Shifted Right)
    if (selectedResult.student.passport) {
      try {
        const imgData = selectedResult.student.passport;
        const format = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        // Shifted to x=175, y=5 to avoid overlap
        doc.addImage(imgData, format, 175, 5, 25, 25); 
      } catch (e) {
        console.error("Error adding passport image", e);
      }
    }

    // Student Details Section
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    const detailsY = 50; // Shifted down slightly
    // Left Column
    doc.text("Name:", 14, detailsY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedResult.student.name.toUpperCase(), 30, detailsY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Admission No:", 14, detailsY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(selectedResult.student.admission_number, 45, detailsY + 6);

    // Right Column
    doc.setFont("helvetica", "bold");
    doc.text("Class:", 140, detailsY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedResult.student.class_name || '', 155, detailsY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 140, detailsY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 155, detailsY + 6);

    // Table
    const tableColumn = ["Subject", "CA1", "CA2", "CA3", "Exam", "Total", "Grade", "Remark"];
    const tableRows: any[] = [];

    selectedResult.scores.forEach((score: any) => {
      const scoreData = [
        score.subject,
        score.ca1 || '-',
        score.ca2 || '-',
        score.ca3 || '-',
        score.exam || '-',
        score.total,
        score.grade,
        score.remark
      ];
      tableRows.push(scoreData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65, // Shifted down
      theme: 'grid',
      headStyles: { fillColor: [30, 27, 75], textColor: 255 }, // Navy 900
      styles: { fontSize: 10, cellPadding: 3 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 5) {
          const val = parseFloat(data.cell.raw as string);
          if (!isNaN(val) && val < 50) {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          }
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Teacher Remark
    if (reportData.teacher_remark) {
      doc.setFont("helvetica", "bold");
      doc.text("Class Teacher's Remark:", 14, finalY);
      doc.setFont("helvetica", "normal");
      doc.text(reportData.teacher_remark, 60, finalY, { maxWidth: 130 });
    }

    // Head Teacher Signature
    if (reportData.head_teacher_signature) {
      try {
        const sigY = finalY + 20;
        doc.text("Head Teacher's Signature:", 14, sigY + 10);
        const imgData = reportData.head_teacher_signature;
        const format = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(imgData, format, 70, sigY, 40, 20);
      } catch (e) {
        console.error("Error adding signature", e);
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generated from School Portal', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    window.open(doc.output('bloburl'), '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Notification Marquee */}
      {notification && (
        <div className="w-full bg-white z-50 shadow-md h-10 flex items-center overflow-hidden border-b border-red-100 sticky top-0">
          <div className="whitespace-nowrap animate-marquee w-full">
            <span className="text-red-600 font-bold text-lg mx-4 inline-block animate-marquee-text">{notification} &nbsp;&nbsp;&nbsp;&nbsp; {notification} &nbsp;&nbsp;&nbsp;&nbsp; {notification}</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div className={`w-64 bg-navy-900 text-white fixed h-full overflow-y-auto hidden md:block ${notification ? 'top-10' : 'top-0'}`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gold-500">
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Student Portal</h1>
                <p className="text-xs text-slate-400">Welcome back</p>
              </div>
            </div>

          <nav className="space-y-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors mb-4"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
            <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedResult(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' && !selectedResult ? 'bg-gold-500 text-navy-900 font-medium' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <User size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => { setActiveTab('check-result'); setSelectedResult(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'check-result' && !selectedResult ? 'bg-gold-500 text-navy-900 font-medium' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <FileText size={20} />
              <span>Check Result</span>
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setSelectedResult(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'history' && !selectedResult ? 'bg-gold-500 text-navy-900 font-medium' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <FileText size={20} />
              <span>Results History</span>
            </button>
            <button 
              onClick={() => { setActiveTab('attendance'); setSelectedResult(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-gold-500 text-navy-900 font-medium' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <BookOpen size={20} />
              <span>Attendance</span>
            </button>
          </nav>
        </div>


      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {!selectedResult ? (
            <>
              {activeTab === 'dashboard' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-navy-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl font-bold text-gold-500 border-4 border-white/20">
                        {student?.name?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{student?.name}</h2>
                        <p className="text-slate-300 flex items-center gap-2">
                          <User size={16} /> Admission No: {student?.admission_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-navy-900 mb-6">Academic Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="text-slate-500 text-sm mb-1">Total Results</div>
                        <div className="text-3xl font-bold text-navy-900">{history.length}</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="text-slate-500 text-sm mb-1">Attendance (Present)</div>
                        <div className="text-3xl font-bold text-green-600">
                          {attendanceHistory.filter(a => a.status === 'present').length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Total: {attendanceHistory.length} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'check-result' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-navy-900 mb-6 text-center">Check Result</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Academic Session</label>
                      <select 
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      >
                        <option value="">Select Session</option>
                        {sessions.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
                      <select 
                        value={selectedTermId}
                        onChange={(e) => setSelectedTermId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                      >
                        <option value="">Select Term</option>
                        {terms.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        if (selectedSessionId && selectedTermId) {
                          viewResult(Number(selectedSessionId), Number(selectedTermId));
                        } else {
                          alert('Please select both session and term');
                        }
                      }}
                      className="w-full bg-navy-900 text-white py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors mt-4"
                    >
                      Check Result
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-bold text-navy-900 mb-6">Results History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-3 px-4 font-semibold text-navy-900">Session</th>
                          <th className="py-3 px-4 font-semibold text-navy-900">Term</th>
                          <th className="py-3 px-4 font-semibold text-navy-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.length > 0 ? (
                          history.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-700">{item.session_name}</td>
                              <td className="py-3 px-4 text-slate-700">{item.term_name}</td>
                              <td className="py-3 px-4">
                                <button 
                                  onClick={() => viewResult(item.session_id, item.term_id)}
                                  className="text-gold-600 hover:text-gold-700 font-medium text-sm"
                                >
                                  View Result
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-500">No results found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'attendance' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-bold text-navy-900 mb-6">Attendance History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-3 px-4 font-semibold text-navy-900">Date</th>
                          <th className="py-3 px-4 font-semibold text-navy-900">Session</th>
                          <th className="py-3 px-4 font-semibold text-navy-900">Term</th>
                          <th className="py-3 px-4 font-semibold text-navy-900 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.length > 0 ? (
                          attendanceHistory.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-700">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-slate-700">{item.session_name}</td>
                              <td className="py-3 px-4 text-slate-700">{item.term_name}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                  item.status === 'present' ? 'bg-green-100 text-green-700' :
                                  item.status === 'absent' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">No attendance records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-navy-50">
                <div>
                  <button 
                    onClick={() => setSelectedResult(null)}
                    className="text-sm text-slate-500 hover:text-navy-900 mb-2 flex items-center gap-1"
                  >
                    &larr; Back to History
                  </button>
                  <h2 className="text-2xl font-bold text-navy-900">Student Result Sheet</h2>
                  <p className="text-slate-600">{selectedResult.session} - {selectedResult.term}</p>
                </div>
                <button onClick={handlePrintResult} className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors">
                  Print Result
                </button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</div>
                    <div className="font-bold text-navy-900">{selectedResult.student.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Admission No</div>
                    <div className="font-bold text-navy-900">{selectedResult.student.admission_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Class</div>
                    <div className="font-bold text-navy-900">{selectedResult.student.class_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date</div>
                    <div className="font-bold text-navy-900">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-navy-900 text-white">
                        <th className="py-3 px-4 rounded-tl-lg">Subject</th>
                        <th className="py-3 px-4 text-center">CA1</th>
                        <th className="py-3 px-4 text-center">CA2</th>
                        <th className="py-3 px-4 text-center">CA3</th>
                        <th className="py-3 px-4 text-center">Exam</th>
                        <th className="py-3 px-4 text-center">Total</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 rounded-tr-lg">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResult.scores.map((score: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-navy-900">{score.subject}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{score.ca1 || '-'}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{score.ca2 || '-'}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{score.ca3 || '-'}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{score.exam || '-'}</td>
                          <td className={`py-3 px-4 text-center font-bold ${score.total < 50 ? 'text-red-600' : 'text-navy-900'}`}>{score.total}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block w-8 h-8 leading-8 rounded-full text-xs font-bold ${
                              score.grade === 'A' ? 'bg-green-100 text-green-700' :
                              score.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                              score.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              score.grade === 'F' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {score.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{score.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  );
}
