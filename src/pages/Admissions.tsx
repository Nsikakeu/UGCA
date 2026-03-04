import { motion } from 'motion/react';
import { FileText, ClipboardCheck, UserCheck, CreditCard, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admissions() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Admissions</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Join the Uyo Golden City Academy family. Your child's journey to excellence starts here.
          </p>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">How to Apply</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our admission process is designed to be simple and transparent. Follow these steps to enroll your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10" />

            {[
              {
                icon: <FileText size={24} />,
                title: "1. Inquiry",
                desc: "Visit the school or contact us to learn more about our programs and facilities."
              },
              {
                icon: <ClipboardCheck size={24} />,
                title: "2. Application",
                desc: "Purchase and fill out the admission form. Submit it with the required documents."
              },
              {
                icon: <UserCheck size={24} />,
                title: "3. Assessment",
                desc: "Schedule an entrance assessment for your child to determine placement."
              },
              {
                icon: <CreditCard size={24} />,
                title: "4. Enrollment",
                desc: "Upon acceptance, pay the necessary fees to secure your child's spot."
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-16 h-16 bg-navy-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors duration-300 relative z-10 border-4 border-white shadow-sm">
                  {step.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Form */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">Online Admission Application</h2>
              <p className="text-slate-600">Fill out the form below to apply for admission.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              
              // Helper to read file as base64
              const readFile = (file: File): Promise<string | null> => {
                return new Promise((resolve) => {
                  if (!file || file.size === 0) return resolve(null);
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                });
              };

              const passportFile = (form.querySelector('input[name="passport"]') as HTMLInputElement)?.files?.[0];
              const resultFile = (form.querySelector('input[name="result"]') as HTMLInputElement)?.files?.[0];

              Promise.all([
                passportFile ? readFile(passportFile) : Promise.resolve(null),
                resultFile ? readFile(resultFile) : Promise.resolve(null)
              ]).then(([passportBase64, resultBase64]) => {
                const data = {
                  fullname: formData.get('fullname'),
                  gender: formData.get('gender'),
                  dob: formData.get('dob'),
                  nationality: formData.get('nationality'),
                  state: formData.get('state'),
                  lga: formData.get('lga'),
                  address: formData.get('address'),
                  phone: formData.get('phone'),
                  former_school: formData.get('former_school'),
                  former_class: formData.get('former_class'),
                  class_applying_for: formData.get('class_applying_for'),
                  passport: passportBase64,
                  result: resultBase64
                };

                fetch('/api/admissions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(resData => {
                  if (resData.success) {
                    alert('Application submitted successfully!');
                    form.reset();
                  } else {
                    alert('Failed to submit application: ' + resData.error);
                  }
                })
                .catch(err => alert('Error submitting form'));
              });

            }} className="space-y-6">
              
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input name="fullname" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="Surname Firstname Othername" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all bg-white">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" name="dob" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Passport Photograph</label>
                    <input type="file" name="passport" accept="image/*" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100" />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-4 border-b border-slate-100 pb-2 pt-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                    <input name="nationality" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="e.g. Nigerian" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State of Origin</label>
                    <input name="state" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="e.g. Akwa Ibom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LGA</label>
                    <input name="lga" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="e.g. Uyo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent's Phone Number</label>
                    <input type="tel" name="phone" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="080..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                    <textarea name="address" required rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="Enter full address"></textarea>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-4 border-b border-slate-100 pb-2 pt-4">Academic Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Former School</label>
                    <input name="former_school" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="Name of previous school" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class in Former School</label>
                    <input name="former_class" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all" placeholder="e.g. Primary 4" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class Applying For</label>
                    <select name="class_applying_for" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all bg-white">
                      <option value="">Select Class</option>
                      {/* Ideally fetch classes from API, but for now hardcode common ones or fetch if possible. 
                          Since this is a public page, we might need a public endpoint for classes. 
                          For now, I'll add a few standard options. */}
                      <option value="1">Creche</option>
                      <option value="2">Nursery 1</option>
                      <option value="3">Nursery 2</option>
                      <option value="4">Nursery 3</option>
                      <option value="5">Primary 1</option>
                      <option value="6">Primary 2</option>
                      <option value="7">Primary 3</option>
                      <option value="8">Primary 4</option>
                      <option value="9">Primary 5</option>
                      <option value="10">Primary 6</option>
                      <option value="11">JSS 1</option>
                      <option value="12">JSS 2</option>
                      <option value="13">JSS 3</option>
                      <option value="14">SSS 1</option>
                      <option value="15">SSS 2</option>
                      <option value="16">SSS 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Result from Previous School</label>
                    <input type="file" name="result" accept=".pdf,image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100" />
                    <p className="text-xs text-slate-400 mt-1">Upload scanned result (PDF or Image)</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg">
                  Submit Application
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-6">Admission Requirements</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                To ensure a smooth admission process, please ensure you have the following documents ready when submitting your application form.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Completed Admission Form",
                  "2 Recent Passport Photographs",
                  "Copy of Birth Certificate",
                  "Previous School Records (if applicable)",
                  "Medical Report/Immunization Record"
                ].map((req, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-slate-700 bg-white p-4 rounded-lg shadow-sm border border-slate-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <ClipboardCheck size={14} />
                    </div>
                    {req}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-900 text-white p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              
              <h3 className="font-serif text-2xl font-bold mb-6">Tuition & Fees</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Our fee structure is designed to provide the best value for quality education. Fees vary by grade level. Please contact the admissions office for the current fee schedule.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-gold-400 mb-1">Contact for Details</h4>
                  <p className="text-sm text-slate-300">Call 081363215668 or visit the school office.</p>
                </div>
                
                <Link 
                  to="/contact"
                  className="block w-full bg-gold-500 hover:bg-gold-600 text-navy-900 text-center font-semibold py-4 rounded-xl transition-colors shadow-lg"
                >
                  Contact Admissions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Form CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gold-50 border border-gold-200 rounded-3xl p-10 md:p-16">
            <Download size={48} className="text-gold-600 mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">Download Admission Form</h2>
            <p className="text-slate-700 mb-8 max-w-lg mx-auto">
              You can download the admission form online, fill it out, and bring it to the school office to speed up the process.
            </p>
            <button className="bg-navy-900 hover:bg-navy-800 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2">
              Download PDF Form <Download size={18} />
            </button>
            <p className="mt-4 text-xs text-slate-500">* Form submission fee applies at the office.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
