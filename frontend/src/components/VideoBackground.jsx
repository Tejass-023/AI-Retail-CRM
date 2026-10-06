import React, { useState } from 'react';

const VideoBackground = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-slate-950">
      {/* High-Tech Dark Ambient Looping Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-40 scale-105' : 'opacity-0'
        }`}
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-digital-network-nodes-connections-41559-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90 backdrop-blur-[2px]"></div>
      
      {/* Glowing Ambient Radial Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default VideoBackground;
