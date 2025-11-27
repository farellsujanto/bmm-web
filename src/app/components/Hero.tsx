'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  height?: string;
}

export default function Hero({
  title,
  subtitle,
  backgroundImage = '/hero-bg.jpg',
  ctaText = 'Explore Now',
  ctaLink = '/shop',
  height = 'h-screen'
}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  return (
    <div className={`relative ${height} flex items-center justify-center overflow-hidden`}>
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
          {subtitle}
        </p>
        {ctaText && ctaLink && (
          <Link
            href={ctaLink}
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delay-2"
          >
            {ctaText}
          </Link>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
