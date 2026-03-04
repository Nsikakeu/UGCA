import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            We'd love to hear from you. Get in touch with us for inquiries, admissions, or support.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="w-12 h-12 bg-gold-100 text-gold-600 rounded-xl flex items-center justify-center mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Call Us</h3>
                <p className="text-slate-600 mb-4">Mon-Fri from 8am to 4pm.</p>
                <div className="space-y-2">
                  <a href="tel:081363215668" className="block text-navy-700 hover:text-gold-600 font-medium transition-colors">081363215668</a>
                  <a href="tel:07064718334" className="block text-navy-700 hover:text-gold-600 font-medium transition-colors">07064718334</a>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="w-12 h-12 bg-navy-100 text-navy-600 rounded-xl flex items-center justify-center mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Email Us</h3>
                <p className="text-slate-600 mb-4">Our friendly team is here to help.</p>
                <a href="mailto:ugcaekomiman23@gmail.com" className="text-navy-700 hover:text-gold-600 font-medium transition-colors break-all">
                  ugcaekomiman23@gmail.com
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Visit Us</h3>
                <p className="text-slate-600 mb-4">Come say hello at our school campus.</p>
                <p className="text-navy-700 font-medium">
                  Obot Ndom, Ekom Iman,<br />Etinan, AKS, Nigeria
                </p>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100 h-full"
              >
                <h2 className="font-serif text-3xl font-bold text-navy-900 mb-6">Send us a Message</h2>
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const data = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    message: formData.get('message')
                  };

                  fetch('/api/enquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  })
                  .then(res => res.json())
                  .then(resData => {
                    if (resData.success) {
                      alert('Message sent successfully!');
                      form.reset();
                    } else {
                      alert('Failed to send message: ' + resData.error);
                    }
                  })
                  .catch(() => alert('Error sending message'));
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        id="firstName" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        id="lastName" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      id="email" 
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      id="phone" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="+234..."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea 
                      id="message" 
                      name="message"
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-4 rounded-lg transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
