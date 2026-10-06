import React, { useEffect, useRef } from 'react';

const Animated3DBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 3D Nodes
    const numNodes = Math.min(60, Math.floor(width / 25));
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1.5,
        color: Math.random() > 0.5 ? '#3b82f6' : '#10b981'
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw dark ambient gradient background
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#090d16');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw ambient glowing orbs
      const time = Date.now() * 0.001;
      const orb1X = width * 0.3 + Math.sin(time * 0.5) * 150;
      const orb1Y = height * 0.4 + Math.cos(time * 0.3) * 100;
      const orbGrad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 350);
      orbGrad1.addColorStop(0, 'rgba(37, 99, 235, 0.18)');
      orbGrad1.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = orbGrad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.7 + Math.cos(time * 0.4) * 150;
      const orb2Y = height * 0.6 + Math.sin(time * 0.6) * 100;
      const orbGrad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 350);
      orbGrad2.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      orbGrad2.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = orbGrad2;
      ctx.fillRect(0, 0, width, height);

      // Update & Draw 3D Mesh Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        if (node.z < 0 || node.z > 1000) node.vz *= -1;

        // Perspective scale
        const scale = 1000 / (1000 + node.z);
        const drawX = (node.x - width / 2) * scale + width / 2;
        const drawY = (node.y - height / 2) * scale + height / 2;
        const drawRadius = node.radius * scale;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const otherScale = 1000 / (1000 + other.z);
          const otherX = (other.x - width / 2) * otherScale + width / 2;
          const otherY = (other.y - height / 2) * otherScale + height / 2;

          const dx = drawX - otherX;
          const dy = drawY - otherY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.25 * scale;
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = node.color === '#3b82f6' 
              ? `rgba(59, 130, 246, ${alpha})` 
              : `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }
        }

        // Draw Node Particle
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 12 * scale;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default Animated3DBackground;
