import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Classroom",
    title: "Interactive Learning"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1577896334623-e74235c96163?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Facilities",
    title: "Modern Library"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Students",
    title: "Student Collaboration"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Events",
    title: "Graduation Day"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Facilities",
    title: "Computer Lab"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1511629091441-ee46146481b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Classroom",
    title: "Art Class"
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Events",
    title: "Cultural Day"
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1427504746696-ea5abd7dfe5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "Students",
    title: "Sports Activities"
  },
  {
    id: 9,
    src: "https://lh3.googleusercontent.com/d/1RghtpVMG66GaXfi1COlegCvl2KlGOkJL",
    category: "Campus",
    title: "School Grounds"
  },
  {
    id: 10,
    src: "https://lh3.googleusercontent.com/d/1pv_GkMpfuYDL47nUWegRWuZxuoFW9FCE",
    category: "Campus",
    title: "Main Building"
  }
];

const categories = ["All", "Classroom", "Facilities", "Students", "Events", "Campus"];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            A glimpse into the vibrant life at Uyo Golden City Academy.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredImages.map((image) => (
                <motion.div
                  layout
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow bg-white"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.src} 
                    alt={image.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-center p-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                        <ZoomIn size={24} />
                      </div>
                      <h3 className="text-white font-serif font-bold text-lg">{image.title}</h3>
                      <p className="text-gold-300 text-sm font-medium uppercase tracking-wider">{image.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-900/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>

            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors hidden md:block"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              <ChevronLeft size={48} />
            </button>

            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors hidden md:block"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <ChevronRight size={48} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title} 
                className="w-full h-full object-contain max-h-[85vh] bg-black"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="font-serif text-2xl font-bold">{selectedImage.title}</h3>
                <p className="text-gold-400 text-sm">{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
