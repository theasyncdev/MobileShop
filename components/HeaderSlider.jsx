import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      imgSrc: assets.banner1,
    },
    {
      id: 2,
      imgSrc: assets.banner2,
    },
    {
      id: 3,
      imgSrc: assets.banner3,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full mt-8">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="min-w-full h-64 md:h-80 lg:h-96 bg-[#E6E9F2] rounded-xl"
          >
            <Image
              className="w-full h-full object-cover rounded-xl"
              src={slide.imgSrc}
              alt={`Slide ${index + 1}`}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-20">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
