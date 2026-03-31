import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";

type GalleryItem = {
  id: number;
  src: string;
  category: string;
  title: string;
  type?: "image" | "video";
  thumbnail?: string;
};

const galleryImages: GalleryItem[] = [
  {
    id: 1,
    src: "https://lh3.googleusercontent.com/d/1pv_GkMpfuYDL47nUWegRWuZxuoFW9FCE",
    category: "Facilities",
    title: "Computer Lab",
  },
  {
    id: 2,
    src: "https://lh3.googleusercontent.com/d/1ZhpLFdEVxVFjY4bcqkx1iiju8bF5QHKM",
    category: "Pupils",
    title: "Back from Excursion",
  },
  {
    id: 3,
    src: "https://lh3.googleusercontent.com/d/1Gj8eLu1ap8xsHBt9iStKs1TNukl8P6VU",
    category: "Staff",
    title: "Our Staff",
  },
  {
    id: 4,
    src: "https://lh3.googleusercontent.com/d/1HsVyvLjd8nxtJirnHuNOCvZJer6Ji1EV",
    category: "Facilities",
    title: "Entrepreneurship Practical",
  },
  {
    id: 5,
    src: "https://lh3.googleusercontent.com/d/1WCTGhqWS7cjesxGBgGXqzt8mY-7jR6JQ",
    category: "Events",
    title: "Excursion to Ibom Air",
  },
  {
    id: 6,
    src: "https://lh3.googleusercontent.com/d/1OunMP9y1VAXyRONfEHTvhTc4rZNIYq6J",
    category: "Events",
    title: "Excursion",
  },
  {
    id: 7,
    src: "https://lh3.googleusercontent.com/d/1rUSNQL0sRyYq4BOYV4sFcn_epGZblaL_",
    category: "Events",
    title: "Sporting Activity",
  },
  {
    id: 8,
    src: "https://lh3.googleusercontent.com/d/15rRQinfJo3mc3FWGViAUgDx4rQseMXcs",
    category: "School Environment",
    title: "Main Building",
  },
  {
    id: 9,
    src: "https://drive.google.com/file/d/1MvdgmbSr0TlVJsCHkaYC_YW81q-zDlJ7/preview",
    category: "Facilities",
    title: "Sport Facilities",
    type: "video",
  },
  {
    id: 10,
    src: "https://drive.google.com/file/d/17cqR_4LbhXsS0_Kdhh6MZp1THNaXtVSY/preview",
    category: "Events",
    title: "2025 Graduation",
    type: "video",
  },
  {
    id: 11,
    src: "https://drive.google.com/file/d/1tMT6LOCeB6mFTgLVVeYhr4kY1VlZVEr-/preview",
    category: "Events",
    title: "Merit Cash Award",
    type: "video",
  },
  {
    id: 12,
    src: "https://drive.google.com/file/d/16Zzu80VCEbTNHc_29UpFcVY-7WQmJ9nI/preview",
    category: "School Environment",
    title: "Environment Tour",
    type: "video",
  },
  {
    id: 13,
    src: "https://drive.google.com/file/d/1vql7sfP8we-X-Il2Lyv6_dHVzdwxtQag/preview",
    category: "Classroom",
    title: "Classroom Tour",
    type: "video",
  },
  {
    id: 14,
    src: "https://lh3.googleusercontent.com/d/1GxkXlAsK3VFq5ZN2fOQvdvRZLE517v8p",
    category: "School Environment",
    title: "School Entrance",
  },
  {
    id: 15,
    src: "https://lh3.googleusercontent.com/d/1inE-8GE78iuy9nr4DZafMi5vKeb7YlTO",
    category: "Events",
    title: "Cultural Day",
  },
  {
    id: 16,
    src: "https://lh3.googleusercontent.com/d/1BGZu8z0BqvHEywWebYWCVIvRLqop9D2J",
    category: "Pupils",
    title: "2025 Graduands",
  },
];

const categories = [
  "All",
  "Classroom",
  "Facilities",
  "Pupils",
  "Events",
  "School Environment",
  "Staff",
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  // Preload next and previous images when lightbox is open
  useEffect(() => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % filteredImages.length;
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;

    const nextImg = filteredImages[nextIndex];
    if (nextImg && nextImg.type !== "video") {
      const img = new Image();
      img.src = nextImg.src;
    }

    const prevImg = filteredImages[prevIndex];
    if (prevImg && prevImg.type !== "video") {
      const img = new Image();
      img.src = prevImg.src;
    }
  }, [selectedImage, filteredImages]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Our Gallery
          </h1>
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
                    ? "bg-navy-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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
                  className={
                    image.type === "video" ? "group" : "group cursor-pointer"
                  }
                  onClick={() => {
                    if (image.type !== "video") setSelectedImage(image);
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-shadow bg-white">
                    {image.type === "video" ? (
                      <iframe
                        src={image.src}
                        allow="autoplay; fullscreen"
                        loading="lazy"
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <>
                        <img
                          src={image.thumbnail || image.src}
                          alt={image.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/40 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-center p-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                              <ZoomIn size={24} />
                            </div>
                            <h3 className="text-white font-serif font-bold text-lg">
                              {image.title}
                            </h3>
                            <p className="text-gold-300 text-sm font-medium uppercase tracking-wider">
                              {image.category}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pt-3 text-center">
                    <h3 className="font-bold text-navy-900 text-lg">
                      {image.title}
                    </h3>
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
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronLeft size={48} />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors hidden md:block"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight size={48} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full rounded-lg overflow-hidden shadow-2xl flex items-center justify-center bg-black aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage.type === "video" ? (
                <iframe
                  src={selectedImage.src}
                  allow="autoplay; fullscreen"
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              ) : (
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain max-h-[85vh] bg-black"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white pointer-events-none">
                <h3 className="font-serif text-2xl font-bold">
                  {selectedImage.title}
                </h3>
                <p className="text-gold-400 text-sm">
                  {selectedImage.category}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
