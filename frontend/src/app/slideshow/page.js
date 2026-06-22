"use client";
import { useEffect, useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Play, Pause, X, ChevronLeft, ChevronRight, Maximize, Minimize,
  Settings, Zap, Clock, Image as ImageIcon, Info
} from 'lucide-react';
import Link from 'next/link';

export default function SlideshowPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-white font-bold uppercase tracking-widest animate-pulse">Initializing Engine...</div>}>
      <SlideshowContent />
    </Suspense>
  );
}

function SlideshowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams.get('projectId');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const [effect, setEffect] = useState('zoom');
  const [duration, setDuration] = useState(6);
  const [showInfo, setShowInfo] = useState(true);
  const [isRandom, setIsRandom] = useState(false);

  const slideshowRef = useRef(null);
  const uiTimeout = useRef(null);

  const handleExit = () => {
    if (projectIdFilter) {
      router.push(`/project/${projectIdFilter}`);
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const url = projectIdFilter
      ? `http://localhost:5000/api/projects/${projectIdFilter}`
      : `http://localhost:5000/api/slideshow`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const finalImages = projectIdFilter ? data.images : data;
        if (finalImages && finalImages.length > 0) {
          const formatted = finalImages.map(img => ({
            ...img,
            project_id: data.id || img.project_id,
            project_name: data.name || img.project_name,
            category: data.category || img.category,
            location: data.location || img.location
          }));
          setImages(formatted);
        }
      });
  }, [projectIdFilter]);

  // 1. ADD THIS: Listener to detect Esc key / Browser Fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If document.fullscreenElement is null, it means we exited fullscreen
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
      }
    };

    // Add the event listener to the document
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup: remove the listener when the component is destroyed
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 2. UPDATE: Simplify your toggle function (Optional but cleaner)
  const toggleFocusMode = () => {
    if (!document.fullscreenElement) {
      slideshowRef.current.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
      // We don't strictly need setIsFocusMode(true) here 
      // because the listener above will catch the change automatically!
      setIsFocusMode(true);
    } else {
      document.exitFullscreen();
      setIsFocusMode(false);
    }
  };

  // Improved Mouse Logic for Focus Mode
  const handleMouseMove = () => {
    setShowUI(true);
    if (uiTimeout.current) clearTimeout(uiTimeout.current);

    // If Focus Mode is ON and Settings are CLOSED, auto-hide UI after 3s
    if (isFocusMode && !showSettings) {
      uiTimeout.current = setTimeout(() => setShowUI(false), 3000);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && images.length > 0) {
      interval = setInterval(() => {
        nextSlide();
      }, duration * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images, duration, isRandom]);

  const nextSlide = () => {
    if (isRandom) {
      setCurrentIndex(Math.floor(Math.random() * images.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    zoom: { initial: { opacity: 0, scale: 1.2 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 1.5 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 1 } },
    slide: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '-100%' }, transition: { duration: 0.8, ease: "easeInOut" } }
  };

  if (images.length === 0) return <div className="h-screen bg-black" />;

  const currentImg = images[currentIndex];

  return (
    <div
      ref={slideshowRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden bg-black
        ${isFocusMode
          ? 'h-screen w-full rounded-none'
          : 'h-[90vh] w-full max-w-7xl rounded-[1rem] shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/5'
        }
        ${isFocusMode && !showUI ? 'cursor-none' : 'cursor-default'}
      `}
    >
      {/* 1. IMAGE LAYER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${effect}-${currentIndex}`}
          className="absolute inset-0"
          {...variants[effect]}
        >
          <img
            src={`http://localhost:5000/uploads/${currentImg.file_path}`}
            alt={currentImg.project_name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. CINEMATIC OVERLAYS (Vignette & Gradient) */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.85)] z-20" />
      {/* UPDATED: Gradient now stays if showInfo is ON, even if showUI is OFF */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent transition-opacity duration-1000 pointer-events-none z-10 
  ${showInfo ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* 3. INTERACTIVE UI ELEMENTS */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[60] absolute inset-0 pointer-events-none">

            {/* Top Bar (Exit & Settings) */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-[100] pointer-events-auto">
              <button
                onClick={handleExit}
                className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-red-600 text-white transition-all shadow-2xl border border-white/10"
              >
                <X size={24} />
              </button>
              <div className="flex gap-4">
                <button onClick={() => setShowSettings(!showSettings)} className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-blue-600 transition-all">
                  <Settings size={20} className={showSettings ? 'rotate-90' : ''} />
                </button>
                <button onClick={toggleFocusMode} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold hover:bg-white/20 transition-all border border-white/10">
                  {isFocusMode ? <Minimize size={18} /> : <Maximize size={18} />}
                  {isFocusMode ? "EXIT FOCUS" : "FOCUS MODE"}
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 flex items-center px-6 z-[70] pointer-events-auto">
              <button onClick={prevSlide} className="text-white/30 hover:text-white transition-colors bg-black/10 hover:bg-black/30 p-4 rounded-full backdrop-blur-sm">
                <ChevronLeft size={48} />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-6 z-[70] pointer-events-auto">
              <button onClick={nextSlide} className="text-white/30 hover:text-white transition-colors bg-black/10 hover:bg-black/30 p-4 rounded-full backdrop-blur-sm">
                <ChevronRight size={48} />
              </button>
            </div>

            {/* Play/Pause Button */}
            <div className="absolute bottom-12 right-12 z-[80] pointer-events-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
              >
                {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PROJECT INFO PANEL (Separated for Focus Mode Stability) */}
      {/* 4. PROJECT INFO PANEL - Uncoupled from showUI */}
      <AnimatePresence>
        {showInfo && ( // Removed "showUI &&"
          <div className="absolute bottom-12 left-12 text-white z-[99] pointer-events-auto"
          >
            <Link
              href={`/project/${currentImg.project_id}`}
              className="group/info block cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 inline-block border-b border-blue-400 pb-1 group-hover/info:text-white group-hover/info:border-white transition-all">
                  {currentImg.category} • VIEW DETAILS
                </span>
                <h1 className="text-5xl md:text-6xl font-bold mb-1 tracking-tighter group-hover/info:translate-x-2 transition-transform duration-300">
                  {currentImg.project_name}
                </h1>
                <p className="text-xl text-slate-400 font-light italic group-hover/info:text-slate-200 transition-colors">
                  {currentImg.location}
                </p>
              </div>
            </Link>
          </div>
        )}
      </AnimatePresence>

      {/* 5. PROGRESS BAR */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden z-[90]">
        <motion.div
          key={currentIndex} initial={{ width: 0 }} animate={{ width: "100%" }}
          transition={{ duration: duration, ease: "linear" }}
          className="h-full bg-blue-600"
        />
      </div>

      {/* 6. SETTINGS SIDEBAR */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            className="absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl text-white p-8 z-[110] border-l border-white/10 shadow-2xl pointer-events-auto"
          >
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Settings size={20} /> Settings
            </h2>
            <div className="space-y-8">
              <section>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-4 tracking-widest">Transition</label>
                <div className="grid grid-cols-2 gap-2">
                  {['zoom', 'fade', 'slide'].map(t => (
                    <button key={t} onClick={() => setEffect(t)} className={`py-2 rounded-lg text-sm capitalize font-bold ${effect === t ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>{t}</button>
                  ))}
                </div>
              </section>
              <section>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-4 tracking-widest">Speed ({duration}s)</label>
                <input type="range" min="2" max="20" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </section>
              <section className="space-y-4">
                <Toggle label="Show Project Info" active={showInfo} onClick={() => setShowInfo(!showInfo)} icon={<Info size={16} />} />
                <Toggle label="Shuffle Gallery" active={isRandom} onClick={() => setIsRandom(!isRandom)} icon={<ImageIcon size={16} />} />
              </section>
            </div>
            <button onClick={() => setShowSettings(false)} className="mt-12 w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all">Apply Settings</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ label, active, onClick, icon }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 text-slate-400 group-hover:text-white transition-colors">
        {icon} <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-slate-700'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}