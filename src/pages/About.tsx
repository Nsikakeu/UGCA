import { motion } from 'motion/react';
import { CheckCircle, Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Discover the heart and soul of Uyo Golden City Academy.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gold-50 p-10 rounded-3xl border border-gold-100"
            >
              <div className="w-14 h-14 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 mb-6">
                <Target size={28} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-4">Our Mission</h2>
              <p className="text-slate-700 leading-relaxed">
                To provide a stimulating learning environment that fosters academic excellence, moral integrity, and social responsibility, empowering every child to become a confident and compassionate leader in a global society.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-navy-50 p-10 rounded-3xl border border-navy-100"
            >
              <div className="w-14 h-14 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 mb-6">
                <Eye size={28} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-4">Our Vision</h2>
              <p className="text-slate-700 leading-relaxed">
                To be a premier institution recognized for nurturing well-rounded individuals who are equipped with the knowledge, skills, and values to positively impact their communities and the world at large.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">Our Core Values</h2>
            <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Excellence', 'Integrity', 'Discipline', 'Creativity'].map((value, idx) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-navy-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {value[0]}
                </div>
                <h3 className="font-semibold text-lg text-navy-900">{value}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Message (Placeholder) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-3xl shadow-xl shadow-navy-900/5 overflow-hidden border border-slate-100">
            <div className="md:w-1/3 h-64 md:h-auto bg-slate-200 relative">
               <img 
                src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Principal" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8 md:p-12">
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">From the Principal's Desk</h2>
              <p className="text-slate-600 mb-6 leading-relaxed italic">
                "Welcome to Uyo Golden City Academy. We are dedicated to providing a supportive and challenging environment where every student can thrive. Our commitment to excellence extends beyond the classroom, as we strive to mold character and instill values that will last a lifetime."
              </p>
              <div>
                <p className="font-bold text-navy-900">Principal Name</p>
                <p className="text-sm text-gold-600 font-medium uppercase tracking-wider">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
