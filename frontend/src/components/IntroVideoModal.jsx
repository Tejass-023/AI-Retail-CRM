import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Volume2, VolumeX, Sparkles, Activity, ShieldCheck, Upload, Film } from 'lucide-react';

const IntroVideoModal = ({ customVideoSrc, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blobVideoUrl, setBlobVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('has_seen_intro_video');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('has_seen_intro_video', 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setBlobVideoUrl(localUrl);
      setHasError(false);
    }
  };

  if (!isOpen) return null;

  const currentSrc = blobVideoUrl || customVideoSrc || "/intro.mp4";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Top Header Bar with Skip & Mute Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700/80 text-white text-xs font-bold shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>System Overview Intro</span>
        </div>

        <div className="flex items-center gap-3">
          {/* File Selector Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-full border border-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Select MP4 Video</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700/80 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            {muted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{muted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Top Skip Video Button */}
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center gap-1.5 transform hover:scale-105"
          >
            <span>Skip Video</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 flex items-center justify-center">
        
        {!hasError ? (
          <video
            key={currentSrc}
            ref={videoRef}
            autoPlay
            muted={muted}
            playsInline
            onEnded={handleClose}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          >
            <source src={currentSrc} type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-displaying-data-41560-large.mp4" type="video/mp4" />
          </video>
        ) : (
          /* High-Tech Presentation Fallback with Direct Video Upload Option */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 flex flex-col justify-between relative overflow-hidden text-white">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Need & Demand Intelligence Platform</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                System Ready
              </span>
            </div>

            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
                <Film className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Select Your Video File to Play</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                Click the button below to pick your MP4 video file directly from your computer to play it instantly.
              </p>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse & Select MP4 Video File</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              <span>Note: Browsers require standard H.264 MP4 videos</span>
              <button
                onClick={handleClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all border border-slate-700"
              >
                Skip to Dashboard →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Hint */}
      <p className="text-xs text-slate-400 mt-4 font-medium">
        Press <strong className="text-white">Skip Video</strong> at top-right to enter dashboard immediately.
      </p>

    </div>
  );
};

export default IntroVideoModal;
