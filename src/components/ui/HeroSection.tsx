"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { storeTagline, colors } = useStoreConfig();

  const heroSlides = [
    {
      title: storeTagline || "Just Do It",
      subtitle: "New Collection",
      description: "Discover our latest designs and premium quality products.",
      image: "/AIR+FORCE+1+LUXE.avif",
      cta: "Shop Now",
      ctaLink: "/AIR+FORCE+1+LUXE.avif",
      bgColor: "bg-gradient-to-r from-blue-600 to-purple-600",
    },
    {
      title: "Quality First",
      subtitle: "Premium Products",
      description: "Engineered for excellence, designed for your lifestyle.",
      image: "/banner.webp",
      cta: "Explore",
      ctaLink: "/AIR+FORCE+1+LUXE.avif",
      bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
    },
    {
      title: "Style & Comfort",
      subtitle: "Urban Collection",
      description: "Where fashion meets function in everyday life.",
      image: "/AIR+FORCE+1+LUXE.avif",
      cta: "Discover",
      ctaLink: "/AIR+FORCE+1+LUXE.avif",
      bgColor: "bg-gradient-to-r from-gray-800 to-gray-900",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background slides */}
      {heroSlides.map((slide, index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 ${slide.bgColor} transition-opacity duration-1000`}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <motion.h1
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-6xl md:text-7xl font-bold mb-4"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>

              <motion.h2
                key={`subtitle-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl md:text-3xl font-semibold mb-4 text-gray-200"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.h2>

              <motion.p
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg md:text-xl mb-8 text-gray-300 max-w-md"
              >
                {heroSlides[currentSlide].description}
              </motion.p>

              <motion.div
                key={`cta-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link
                  href={heroSlides[currentSlide].ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Image placeholder */}
            {/* <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="w-full h-96 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
                <p className="text-white text-lg">Product Image</p>
              </div>
            </motion.div> */}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
