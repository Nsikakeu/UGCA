import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookOpen, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const heroImages = [
  "https://lh3.googleusercontent.com/d/1WCTGhqWS7cjesxGBgGXqzt8mY-7jR6JQ", // Image 1 (Added recently)
  "https://lh3.googleusercontent.com/d/1inE-8GE78iuy9nr4DZafMi5vKeb7YlTO", // Image 2 (Added recently)
  "https://lh3.googleusercontent.com/d/1BGZu8z0BqvHEywWebYWCVIvRLqop9D2J", // Image 3 (Added recently)
  "https://lh3.googleusercontent.com/d/1GxkXlAsK3VFq5ZN2fOQvdvRZLE517v8p", // School Exterior / Facilities
  "https://lh3.googleusercontent.com/d/1RghtpVMG66GaXfi1COlegCvl2KlGOkJL", // School Grounds
  "https://lh3.googleusercontent.com/d/1pv_GkMpfuYDL47nUWegRWuZxuoFW9FCE", // Main Building
  "https://lh3.googleusercontent.com/d/1t0Q81qJ7P6rz9W272-rxsJYIrPq-qIeB", // Original slider image
  "https://lh3.googleusercontent.com/d/1Gj8eLu1ap8xsHBt9iStKs1TNukl8P6VU", // Graduation Day
  "https://lh3.googleusercontent.com/d/1U1Qf0iESvAzizhA-Huqv-DVfCt6uNfJC", // Original slider image
  "https://lh3.googleusercontent.com/d/1ZhpLFdEVxVFjY4bcqkx1iiju8bF5QHKM", // Excursion to IbomAir
  "https://lh3.googleusercontent.com/d/1OunMP9y1VAXyRONfEHTvhTc4rZNIYq6J", // Excursion
  "https://lh3.googleusercontent.com/d/1HtLEIZToUYbbdYH1ErtRgYm92CkjTMj_", // Original slider image
  "https://lh3.googleusercontent.com/d/15rRQinfJo3mc3FWGViAUgDx4rQseMXcs", // Main Building (alternate)
  "https://lh3.googleusercontent.com/d/1HsVyvLjd8nxtJirnHuNOCvZJer6Ji1EV", // School Bus
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % heroImages.length;
    const img = new Image();
    img.src = heroImages[nextIndex];
  }, [currentImageIndex]);

  return (
    <div className="overflow-hidden">
      {/* Announcement Marquee */}
      <div className="bg-gold-500 text-navy-900 py-2 overflow-hidden flex items-center">
        <div className="animate-marquee font-semibold text-sm md:text-base">
          We have closed for Second Term on 27th March, 2026 to resume for Third
          Term on 20th April, 2026.
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex]}
              alt="School Life"
              fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/50 to-navy-900/90 z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Uyo Golden City <span className="text-gold-500">Academy</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Empowering the next generation with quality education, moral
              values, and the skills to lead in a changing world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admissions"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-gold-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Enrollment <ArrowRight size={18} />
              </Link>
              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-full font-semibold transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We provide a nurturing environment where every child is encouraged
              to reach their full potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-gold-600" />,
                title: "Academic Excellence",
                desc: "Our curriculum is designed to challenge and inspire students, fostering a love for learning that lasts a lifetime.",
              },
              {
                icon: <Users className="w-8 h-8 text-gold-600" />,
                title: "Experienced Faculty",
                desc: "Our dedicated teachers are passionate about education and committed to the success of every student.",
              },
              {
                icon: <Shield className="w-8 h-8 text-gold-600" />,
                title: "Safe Environment",
                desc: "We prioritize the safety and well-being of our students, providing a secure and supportive atmosphere.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-navy-900/5 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-navy-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2022&q=80"
                  alt="Students in classroom"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-navy-900/10 mix-blend-multiply" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-gold-500 p-8 rounded-2xl shadow-xl hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-navy-900">10+</div>
                  <div className="text-sm font-medium text-navy-800 leading-tight">
                    Years of
                    <br />
                    Excellence
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <span className="text-gold-600 font-semibold tracking-wider uppercase text-sm mb-2 block">
                About Our School
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-900 mb-6">
                Building a Foundation for Future Leaders
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                At Uyo Golden City Academy, we believe that every child is
                unique and capable of greatness. Our holistic approach to
                education ensures that students not only excel academically but
                also develop strong character and social skills.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Located in the serene environment of Obot Ndom, Ekom Iman, we
                provide the perfect setting for focused learning and growth.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-navy-900 font-semibold border-b-2 border-gold-500 hover:text-gold-600 transition-colors pb-1"
              >
                Read Our Story <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-navy-800/30 skew-x-12 transform origin-top" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Golden City Family?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            Admissions are open for the upcoming academic session. Secure your
            child's future with us today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-gold-500/20 active:scale-95"
            >
              Contact Us Now
            </Link>
            <a
              href="tel:081363215668"
              className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Users size={18} /> Call Admissions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
