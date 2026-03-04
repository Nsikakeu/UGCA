import express from 'express';
import { createServer as createViteServer } from 'vite';
import supabase from './supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Middleware for role checking
  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!roles.includes(decoded.role)) return res.status(403).json({ error: 'Forbidden' });
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API Routes ---

  // Auth
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: '${username}'`);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username.trim())
      .single();

    if (error || !user) {
      console.log('User not found or error:', error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match for ${username}: ${passwordMatch}`);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, // Required for SameSite=None
      sameSite: 'none' // Required for cross-origin iframe
    });
    res.json({ user: { id: user.id, role: user.role, name: user.name } });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.put('/api/change-password', requireRole(['super-admin', 'admin', 'teacher']), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;
    
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: hash }).eq('id', userId);
    res.json({ success: true });
  });

  app.get('/api/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      // Fetch fresh user data to get assigned_class_id
      if (decoded.role !== 'student') {
        const { data: user } = await supabase
          .from('users')
          .select('id, role, name, assigned_class_id')
          .eq('id', decoded.id)
          .single();
        res.json({ user });
      } else {
        res.json({ user: decoded });
      }
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Users (Super Admin only)
  app.get('/api/users', requireRole(['super-admin']), async (req, res) => {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, name, temp_password, assigned_class_id, classes(name)');
    
    if (error) return res.status(400).json({ error: error.message });

    // Transform to match frontend expectation (classes(name) -> assigned_class_name)
    const transformedUsers = users.map((u: any) => ({
      ...u,
      assigned_class_name: u.classes?.name
    }));

    res.json(transformedUsers);
  });

  app.post('/api/users', requireRole(['super-admin']), async (req, res) => {
    const { username, role, name, assigned_class_id } = req.body;
    
    // Check if user exists (case-insensitive)
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username.trim())
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Generate random 8-character password
    const password = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(password, 10);
    
    const { error } = await supabase.from('users').insert({
      username: username.trim(),
      password_hash: hash,
      role,
      name,
      temp_password: password,
      assigned_class_id: assigned_class_id || null
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, password });
  });

  app.put('/api/users/:id', requireRole(['super-admin']), async (req, res) => {
    const { name, username, role, assigned_class_id } = req.body;
    const { error } = await supabase
      .from('users')
      .update({ name, username, role, assigned_class_id: assigned_class_id || null })
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.post('/api/users/:id/regenerate-password', requireRole(['super-admin']), async (req, res) => {
    const password = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(password, 10);
    
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash, temp_password: password })
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, password });
  });

  // Students (Admin/Super Admin)
  app.get('/api/students', requireRole(['super-admin', 'admin', 'teacher']), async (req, res) => {
    const user = (req as any).user;
    let query = supabase.from('students').select('*, classes(name)');
    
    // If teacher, only show students in their assigned class
    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      if (teacher && teacher.assigned_class_id) {
        query = query.eq('class_id', teacher.assigned_class_id);
      }
    }

    const { data: students, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const transformedStudents = students.map((s: any) => ({
      ...s,
      class_name: s.classes?.name
    }));

    res.json(transformedStudents);
  });

  app.post('/api/students', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { admission_number, name, class_id, gender, passport } = req.body;
    // Generate random 8-digit PIN
    const pin = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const { error } = await supabase.from('students').insert({
      admission_number, name, class_id, pin, gender, passport
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, pin });
  });
  
  app.post('/api/students/:id/regenerate-pin', requireRole(['super-admin', 'admin']), async (req, res) => {
    const pin = Math.floor(10000000 + Math.random() * 90000000).toString();
    const { error } = await supabase.from('students').update({ pin }).eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, pin });
  });

  // Classes
  app.get('/api/classes', async (req, res) => {
    const { data: classes } = await supabase.from('classes').select('*');
    res.json(classes);
  });

  app.post('/api/classes', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { name, level } = req.body;
    const { error } = await supabase.from('classes').insert({ name, level });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Subjects
  app.get('/api/subjects', async (req, res) => {
    const { data: subjects } = await supabase.from('subjects').select('*');
    res.json(subjects);
  });

  app.post('/api/subjects', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { name, class_id } = req.body;
    const { error } = await supabase.from('subjects').insert({ name, class_id });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Sessions ---
  app.get('/api/sessions', async (req, res) => {
    const { data: sessions } = await supabase.from('sessions').select('*').order('id', { ascending: false });
    res.json(sessions);
  });

  app.post('/api/sessions', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { name } = req.body;
    const { error } = await supabase.from('sessions').insert({ name });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/sessions/:id', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { error } = await supabase.from('sessions').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.put('/api/sessions/:id/current', requireRole(['super-admin', 'admin']), async (req, res) => {
    // Transaction-like behavior not fully supported in client-side calls without RPC, 
    // but we can do sequential updates.
    await supabase.from('sessions').update({ is_current: false }).neq('id', 0); // Update all
    const { error } = await supabase.from('sessions').update({ is_current: true }).eq('id', req.params.id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Terms ---
  app.get('/api/terms', async (req, res) => {
    const { data: terms } = await supabase.from('terms').select('*');
    res.json(terms);
  });

  app.post('/api/terms', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { name } = req.body;
    const { error } = await supabase.from('terms').insert({ name });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/terms/:id', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { error } = await supabase.from('terms').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.put('/api/terms/:id/current', requireRole(['super-admin', 'admin']), async (req, res) => {
    await supabase.from('terms').update({ is_current: false }).neq('id', 0);
    const { error } = await supabase.from('terms').update({ is_current: true }).eq('id', req.params.id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Enhanced Student Management ---
  app.delete('/api/students/:id', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { error } = await supabase.from('students').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.put('/api/students/:id', requireRole(['super-admin', 'admin', 'teacher']), async (req, res) => {
    const { name, admission_number, class_id, gender, passport } = req.body;
    const { error } = await supabase
      .from('students')
      .update({ name, admission_number, class_id, gender, passport })
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // --- Enhanced Class/Subject Management ---
  app.delete('/api/classes/:id', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { error } = await supabase.from('classes').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/subjects/:id', requireRole(['super-admin', 'admin']), async (req, res) => {
    const { error } = await supabase.from('subjects').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Scores (Teacher)
  app.post('/api/scores', requireRole(['teacher', 'admin', 'super-admin']), async (req, res) => {
    const { student_id, subject_id, session_id, term_id, ca1, ca2, ca3, exam, remark } = req.body;
    const user = (req as any).user;

    // If teacher, verify they are assigned to the student's class
    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      const { data: student } = await supabase.from('students').select('class_id').eq('id', student_id).single();
      
      if (!teacher || !teacher.assigned_class_id || teacher.assigned_class_id !== student?.class_id) {
        return res.status(403).json({ error: 'You can only enter scores for your assigned class' });
      }
    }
    
    // Calculate grade
    const total = (Number(ca1) || 0) + (Number(ca2) || 0) + (Number(ca3) || 0) + (Number(exam) || 0);
    let grade = 'F';
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 45) grade = 'D';
    else if (total >= 40) grade = 'E';

    const { error } = await supabase.from('scores').upsert({
      student_id, subject_id, session_id, term_id, ca1, ca2, ca3, exam, grade, remark
    }, { onConflict: 'student_id, subject_id, session_id, term_id' });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Parent Result Check
  app.post('/api/check-result', async (req, res) => {
    const { admission_number, pin, session_id, term_id } = req.body;
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', admission_number)
      .eq('pin', pin)
      .single();
    
    if (!student) {
      return res.status(404).json({ error: 'Invalid admission number or PIN' });
    }

    const { data: scores } = await supabase
      .from('scores')
      .select('ca1, ca2, ca3, exam, total, grade, remark, subjects(name)')
      .eq('student_id', student.id)
      .eq('session_id', session_id)
      .eq('term_id', term_id);

    const transformedScores = scores?.map((s: any) => ({
      ...s,
      subject: s.subjects?.name
    }));

    // Fetch report data
    const { data: reportData } = await supabase
      .from('student_report_data')
      .select('teacher_remark, head_teacher_signature, skills_ratings')
      .eq('student_id', student.id)
      .eq('session_id', session_id)
      .eq('term_id', term_id)
      .maybeSingle();

    res.json({ student, scores: transformedScores, reportData: reportData || {} });
  });

  // Student Auth
  app.post('/api/student/login', async (req, res) => {
    const { admission_number, pin } = req.body;
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('admission_number', admission_number)
      .eq('pin', pin)
      .single();

    if (!student) {
      return res.status(401).json({ error: 'Invalid admission number or PIN' });
    }

    const token = jwt.sign({ id: student.id, role: 'student', name: student.name, admission_number: student.admission_number }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true,
      sameSite: 'none'
    });
    res.json({ user: { id: student.id, role: 'student', name: student.name } });
  });

  // Student Dashboard Data
  app.get('/api/student/results-history', requireRole(['student']), async (req, res) => {
    const studentId = (req as any).user.id;
    // Supabase doesn't support SELECT DISTINCT ON multiple columns easily in JS client without RPC
    // We'll fetch all and filter in JS for now, or use a view.
    // Simpler: Fetch all scores with session/term names
    const { data: scores } = await supabase
      .from('scores')
      .select('session_id, term_id, sessions(name), terms(name)')
      .eq('student_id', studentId);
      
    // Deduplicate in JS
    const historyMap = new Map();
    scores?.forEach((s: any) => {
      const key = `${s.session_id}-${s.term_id}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, {
          session_id: s.session_id,
          term_id: s.term_id,
          session_name: s.sessions?.name,
          term_name: s.terms?.name
        });
      }
    });

    res.json(Array.from(historyMap.values()));
  });

  app.get('/api/student/result/:session_id/:term_id', requireRole(['student']), async (req, res) => {
    const studentId = (req as any).user.id;
    const { session_id, term_id } = req.params;
    
    const { data: scores } = await supabase
      .from('scores')
      .select('ca1, ca2, ca3, exam, total, grade, remark, subjects(name)')
      .eq('student_id', studentId)
      .eq('session_id', session_id)
      .eq('term_id', term_id);

    const transformedScores = scores?.map((s: any) => ({
      ...s,
      subject: s.subjects?.name
    }));

    const { data: session } = await supabase.from('sessions').select('name').eq('id', session_id).single();
    const { data: term } = await supabase.from('terms').select('name').eq('id', term_id).single();
    const { data: student } = await supabase.from('students').select('*, classes(name)').eq('id', studentId).single();

    res.json({ 
      scores: transformedScores, 
      student: { ...student, class_name: student?.classes?.name },
      session: session?.name,
      term: term?.name,
      session_id: session_id, // Added ID
      term_id: term_id        // Added ID
    });
  });

  // Student Attendance History
  app.get('/api/student/attendance', requireRole(['student']), async (req, res) => {
    const studentId = (req as any).user.id;
    const { data: history } = await supabase
      .from('attendance')
      .select('date, status, sessions(name), terms(name)')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    const transformedHistory = history?.map((h: any) => ({
      ...h,
      session_name: h.sessions?.name,
      term_name: h.terms?.name
    }));

    res.json(transformedHistory);
  });

  // Report Card Data
  app.get('/api/report-card-data/:student_id/:session_id/:term_id', requireRole(['teacher', 'admin', 'super-admin', 'student']), async (req, res) => {
    const { student_id, session_id, term_id } = req.params;
    const user = (req as any).user;

    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      const { data: student } = await supabase.from('students').select('class_id').eq('id', student_id).single();
      
      // Use loose equality != to handle potential string/number mismatch
      if (!teacher || !teacher.assigned_class_id || teacher.assigned_class_id != student?.class_id) {
        return res.status(403).json({ error: 'You can only view reports for your assigned class' });
      }
    }

    const { data, error } = await supabase
      .from('student_report_data')
      .select('*')
      .eq('student_id', student_id)
      .eq('session_id', session_id)
      .eq('term_id', term_id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching report data:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || {});
  });

  app.post('/api/report-card-data', requireRole(['teacher', 'admin', 'super-admin']), async (req, res) => {
    const { student_id, session_id, term_id, teacher_remark, head_teacher_signature, skills_ratings } = req.body;
    const user = (req as any).user;

    // Only check class assignment for teachers, not admins
    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      const { data: student } = await supabase.from('students').select('class_id').eq('id', student_id).single();
      
      // Allow if teacher has assigned class AND student is in that class
      if (!teacher || !teacher.assigned_class_id || teacher.assigned_class_id != student?.class_id) {
        return res.status(403).json({ error: 'You can only update reports for your assigned class' });
      }
    }

    // Upsert logic
    const payload: any = {
      student_id,
      session_id,
      term_id,
      teacher_remark
    };
    
    if (head_teacher_signature !== undefined) {
      payload.head_teacher_signature = head_teacher_signature;
    }

    if (skills_ratings !== undefined) {
      payload.skills_ratings = skills_ratings;
    }

    const { error } = await supabase
      .from('student_report_data')
      .upsert(payload, { onConflict: 'student_id, session_id, term_id' });

    if (error) {
      console.error('Error saving report data:', error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  });

  // Get students with results for a specific class/session/term
  app.get('/api/results/students/:class_id/:session_id/:term_id', requireRole(['super-admin']), async (req, res) => {
    const { class_id, session_id, term_id } = req.params;

    // Get distinct student IDs from scores
    const { data: scores, error } = await supabase
      .from('scores')
      .select('student_id')
      .eq('session_id', session_id)
      .eq('term_id', term_id);

    if (error) return res.status(400).json({ error: error.message });

    // Get unique student IDs
    const studentIds = [...new Set(scores.map((s: any) => s.student_id))];

    if (studentIds.length === 0) return res.json([]);

    // Fetch student details
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds)
      .eq('class_id', class_id);

    if (studentsError) return res.status(400).json({ error: studentsError.message });

    res.json(students);
  });

  // Delete Student Result (Super Admin only)
  app.delete('/api/results/:student_id/:session_id/:term_id', requireRole(['super-admin']), async (req, res) => {
    const { student_id, session_id, term_id } = req.params;
    console.log(`Attempting to delete result for student ${student_id}, session ${session_id}, term ${term_id}`);

    const sId = parseInt(student_id);
    const sessId = parseInt(session_id);
    const tId = parseInt(term_id);

    if (isNaN(sId) || isNaN(sessId) || isNaN(tId)) {
      return res.status(400).json({ error: 'Invalid ID parameters' });
    }

    // Delete scores
    const { error: scoresError, count: scoresCount } = await supabase
      .from('scores')
      .delete({ count: 'exact' })
      .eq('student_id', sId)
      .eq('session_id', sessId)
      .eq('term_id', tId);

    if (scoresError) {
      console.error('Error deleting scores:', scoresError);
      return res.status(400).json({ error: scoresError.message });
    }
    console.log(`Deleted ${scoresCount} score records`);

    // Delete report card data
    const { error: reportError, count: reportCount } = await supabase
      .from('student_report_data')
      .delete({ count: 'exact' })
      .eq('student_id', sId)
      .eq('session_id', sessId)
      .eq('term_id', tId);

    if (reportError) {
      console.error('Error deleting report data:', reportError);
      return res.status(400).json({ error: reportError.message });
    }
    console.log(`Deleted ${reportCount} report records`);

    if (scoresCount === 0 && reportCount === 0) {
      return res.status(404).json({ error: 'No records found to delete' });
    }

    res.json({ success: true, scoresDeleted: scoresCount, reportsDeleted: reportCount });
  });

  // Admissions
  app.get('/api/admissions', requireRole(['super-admin']), async (req, res) => {
    const { data: admissions, error } = await supabase
      .from('admissions')
      .select('*, classes(name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const transformedAdmissions = admissions.map((a: any) => ({
      ...a,
      class_name: a.classes?.name
    }));
    res.json(transformedAdmissions);
  });

  app.post('/api/admissions', async (req, res) => {
    const { 
      fullname, gender, dob, nationality, state, lga, address, phone, 
      former_school, former_class, class_applying_for, passport, result 
    } = req.body;

    const { error } = await supabase.from('admissions').insert({
      fullname, gender, dob, nationality, state, lga, address, phone, 
      former_school, former_class, class_applying_for, passport, result
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Enquiries
  app.get('/api/enquiries', requireRole(['super-admin']), async (req, res) => {
    const { data: enquiries } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    res.json(enquiries);
  });

  app.post('/api/enquiries', async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    const { error } = await supabase.from('enquiries').insert({
      first_name: firstName, last_name: lastName, email, phone, message
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Attendance
  app.get('/api/attendance/:class_id/:date', requireRole(['teacher', 'admin', 'super-admin']), async (req, res) => {
    const { class_id, date } = req.params;
    const user = (req as any).user;

    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      if (teacher && teacher.assigned_class_id && teacher.assigned_class_id != class_id) {
        return res.status(403).json({ error: 'You can only view attendance for your assigned class' });
      }
    }

    const { data: attendance } = await supabase
      .from('attendance')
      .select('*, students(name, admission_number)')
      .eq('class_id', class_id)
      .eq('date', date);

    const transformedAttendance = attendance?.map((a: any) => ({
      ...a,
      student_name: a.students?.name,
      admission_number: a.students?.admission_number
    }));

    res.json(transformedAttendance);
  });

  app.post('/api/attendance', requireRole(['teacher', 'admin', 'super-admin']), async (req, res) => {
    const { class_id, session_id, term_id, date, records } = req.body;
    const user = (req as any).user;
    
    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      if (teacher && teacher.assigned_class_id && teacher.assigned_class_id != class_id) {
        return res.status(403).json({ error: 'You can only mark attendance for your assigned class' });
      }
    }

    const { error } = await supabase.from('attendance').upsert(
      records.map((r: any) => ({
        student_id: r.student_id,
        class_id,
        session_id,
        term_id,
        date,
        status: r.status
      })),
      { onConflict: 'student_id, date' }
    );

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Attendance History
  app.get('/api/attendance-history/:class_id/:session_id/:term_id', requireRole(['teacher', 'admin', 'super-admin']), async (req, res) => {
    const { class_id, session_id, term_id } = req.params;
    const user = (req as any).user;

    if (user.role === 'teacher') {
      const { data: teacher } = await supabase.from('users').select('assigned_class_id').eq('id', user.id).single();
      if (teacher && teacher.assigned_class_id && teacher.assigned_class_id != class_id) {
        return res.status(403).json({ error: 'You can only view attendance for your assigned class' });
      }
    }

    // Complex aggregation is hard in Supabase JS client without Views or RPC.
    // Fetch all records and aggregate in JS for now.
    const { data: records } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('class_id', class_id)
      .eq('session_id', session_id)
      .eq('term_id', term_id);

    const historyMap = new Map();
    records?.forEach((r: any) => {
      if (!historyMap.has(r.date)) {
        historyMap.set(r.date, { date: r.date, present_count: 0, absent_count: 0, late_count: 0 });
      }
      const entry = historyMap.get(r.date);
      if (r.status === 'present') entry.present_count++;
      else if (r.status === 'absent') entry.absent_count++;
      else if (r.status === 'late') entry.late_count++;
    });

    res.json(Array.from(historyMap.values()).sort((a: any, b: any) => b.date.localeCompare(a.date)));
  });

  // Notifications
  app.get('/api/notifications', async (req, res) => {
    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    res.json(notification || {});
  });

  app.post('/api/notifications', requireRole(['admin', 'super-admin']), async (req, res) => {
    const { message, is_active } = req.body;
    
    if (is_active) {
      await supabase.from('notifications').update({ is_active: false }).neq('id', 0);
    }
    
    const { data, error } = await supabase.from('notifications').insert({ message, is_active }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ id: data.id });
  });

  // Catch-all for API routes to prevent HTML fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Global error handler for API routes
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.url.startsWith('/api/')) {
      console.error('API Error:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } else {
      next(err);
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite middleware...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware started.');
    } catch (e) {
      console.error('Failed to start Vite middleware:', e);
    }
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
