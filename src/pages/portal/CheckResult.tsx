import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Download, Printer, AlertCircle, ArrowLeft } from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    category: "PERSONAL DEVELOPMENT",
    skills: ["Initiative", "Honesty", "Self-Control", "Self-Reliance", "Obedience", "Aesthetic Appreciation"]
  },
  {
    category: "SENSE OF RESPONSIBILITY",
    skills: ["Punctuality", "Neatness", "Perseverance", "Attendance", "Creativity", "Organizational Ability"]
  },
  {
    category: "SOCIAL DEV.",
    skills: ["Promptness", "Sense of value", "Politeness", "Socialbility", "Consideration for others", "Spirit of Co-operation"]
  },
  {
    category: "PSYCHOMOTO DEV",
    skills: ["Reading & Writing", "Verbal Communication", "Sports & Games", "Handling of Tools", "Painting & Drawing", "Musical Skills", "Crafts"]
  }
];

export default function CheckResult() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [selectedSession, setSelectedSession] = useState('1');
  const [terms, setTerms] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/terms').then(res => res.json()).then(data => {
      setTerms(Array.isArray(data) ? data : []);
    });
    fetch('/api/sessions').then(res => res.json()).then(data => {
      setSessions(Array.isArray(data) ? data : []);
      // Auto-select current session
      const current = Array.isArray(data) ? data.find((s: any) => s.is_current) : null;
      if (current) setSelectedSession(current.id.toString());
    });
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setReportData(null);

    try {
      const res = await fetch('/api/check-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          admission_number: admissionNumber, 
          pin,
          session_id: parseInt(selectedSession),
          term_id: parseInt(selectedTerm)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        if (data.reportData) {
          // Handle legacy data where skills were packed in remark
          let remark = data.reportData.teacher_remark || '';
          let skills = data.reportData.skills_ratings || {};
          
          // If skills_ratings is empty/null but remark contains packed skills, unpack them
          if ((!skills || Object.keys(skills).length === 0) && remark.includes('|||SKILLS|||')) {
            const parts = remark.split('|||SKILLS|||');
            remark = parts[0];
            try {
              skills = JSON.parse(parts[1]);
            } catch (e) {
              console.error('Error parsing legacy skills:', e);
            }
          }
          
          setReportData({
            ...data.reportData,
            teacher_remark: remark,
            skills_ratings: skills
          });
        }
      } else {
        setError(data.error || 'Could not find result');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #result-sheet, #result-sheet * {
            visibility: visible;
          }
          #result-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { margin: 0; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-navy-900 mb-6 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-navy-900">Check Student Result</h1>
          <p className="text-slate-600 mt-2">Enter the student's admission number and PIN to view results.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8"
        >
          <form onSubmit={handleCheck} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Admission Number</label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                placeholder="e.g. UGCA/2024/001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Access PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                placeholder="Enter 6-digit PIN"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              >
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>{session.name} {session.is_current ? '(Current)' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              >
                {terms.length > 0 ? (
                  [...terms].sort((a, b) => {
                    // Try to sort by name first
                    const order: Record<string, number> = { 'first term': 1, 'second term': 2, 'third term': 3 };
                    const cleanName = (name: string) => (name || '').toLowerCase().trim();
                    
                    const aName = cleanName(a.name);
                    const bName = cleanName(b.name);
                    
                    const aOrder = order[aName] || 99;
                    const bOrder = order[bName] || 99;
                    
                    // If both match known terms, sort by that order
                    if (aOrder !== 99 && bOrder !== 99) {
                        return aOrder - bOrder;
                    }
                    
                    // If one matches and other doesn't, prioritize the match
                    if (aOrder !== 99) return -1;
                    if (bOrder !== 99) return 1;
                    
                    // Fallback: Sort by ID (assuming 1=First, 2=Second, 3=Third)
                    return a.id - b.id;
                  }).map(term => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))
                ) : (
                  <>
                    <option value="1">First Term</option>
                    <option value="2">Second Term</option>
                    <option value="3">Third Term</option>
                  </>
                )}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 h-[50px]"
            >
              {isLoading ? 'Checking...' : <><Search size={18} /> Check Result</>}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </motion.div>

        {result && (
          <motion.div 
            id="result-sheet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="bg-navy-900 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-serif">{result.student.name}</h2>
                <p className="text-gold-400 text-sm">{result.student.admission_number}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" 
                  title="Print"
                >
                  <Printer size={20} />
                </button>
                <button 
                  onClick={() => window.print()}
                  className="p-2 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded-lg transition-colors" 
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold text-navy-900">Subject</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">CA 1</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">CA 2</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">CA 3</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">Exam</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">Total</th>
                    <th className="py-3 px-4 font-semibold text-navy-900 text-center">Grade</th>
                    <th className="py-3 px-4 font-semibold text-navy-900">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scores.map((score: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{score.subject}</td>
                      <td className="py-3 px-4 text-slate-600 text-center">{score.ca1}</td>
                      <td className="py-3 px-4 text-slate-600 text-center">{score.ca2}</td>
                      <td className="py-3 px-4 text-slate-600 text-center">{score.ca3}</td>
                      <td className="py-3 px-4 text-slate-600 text-center">{score.exam}</td>
                      <td className={`py-3 px-4 font-bold text-center ${score.total < 50 ? 'text-red-600' : 'text-navy-900'}`}>{score.total}</td>
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
                      <td className="py-3 px-4 text-slate-600 text-sm italic">{score.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grading Key */}
              <div className="mt-8 mx-6 p-4 bg-slate-50 rounded border border-slate-200 text-xs text-center font-mono">
                <span className="font-bold block mb-2 text-navy-900">RATING FOR COGNITIVE DOMAIN</span>
                <div className="flex flex-wrap justify-center gap-4 text-slate-700">
                  <span>100 - EXCELLENT</span>
                  <span>70-74 (VERY GOOD)</span>
                  <span>65-69 (GOOD)</span>
                  <span>50-64 (CREDIT)</span>
                  <span>40-49 (PASS)</span>
                  <span>0-39 (FAIL)</span>
                </div>
              </div>

              {/* Skills Section */}
              {reportData?.skills_ratings && Object.keys(reportData.skills_ratings).length > 0 && (
                <div className="mt-8 mx-6">
                  <h4 className="font-bold text-navy-900 mb-4 border-b border-slate-200 pb-2 text-sm uppercase">Skills Development & Behaviour Attributes</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {SKILL_CATEGORIES.map(({ category, skills }) => (
                      <div key={category} className="mb-4">
                        <table className="w-full text-xs border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-300 px-2 py-1 text-left font-bold text-navy-900 w-1/2">{category}</th>
                              <th className="border border-slate-300 px-1 py-1 text-center w-8">5</th>
                              <th className="border border-slate-300 px-1 py-1 text-center w-8">4</th>
                              <th className="border border-slate-300 px-1 py-1 text-center w-8">3</th>
                              <th className="border border-slate-300 px-1 py-1 text-center w-8">2</th>
                              <th className="border border-slate-300 px-1 py-1 text-center w-8">1</th>
                            </tr>
                          </thead>
                          <tbody>
                            {skills.map((skill, idx) => (
                              <tr key={skill} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">{skill}</td>
                                {[5, 4, 3, 2, 1].map(rating => (
                                  <td key={rating} className="border border-slate-300 px-1 py-1 text-center">
                                    {reportData.skills_ratings[skill] === rating ? (
                                      <span className="inline-block w-4 h-4 bg-navy-900 text-white rounded-sm leading-4 text-[10px]">✓</span>
                                    ) : null}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 italic text-right border-t border-slate-200 pt-2">
                    Key: 5-Excellent, 4-Good, 3-Fair, 2-Poor, 1-None
                  </div>
                </div>
              )}

              {reportData && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6 mx-6 mb-6">
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Class Teacher's Remark:</h4>
                    <p className="text-slate-700 italic">{reportData.teacher_remark || 'No remark yet.'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Head Teacher's Signature:</h4>
                    {reportData.head_teacher_signature ? (
                      <img src={reportData.head_teacher_signature} alt="Head Teacher Signature" className="h-16 object-contain" />
                    ) : (
                      <p className="text-slate-400 text-sm">Not signed yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
