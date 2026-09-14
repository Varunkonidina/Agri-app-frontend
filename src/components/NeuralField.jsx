import { useEffect, useRef } from "react";

const ACCENTS = ["#2f6690", "#4c7a3c", "#a66a2e", "#a9820c"];

/**
 * A slow-drifting node/edge network rendered on canvas - a nod to the four
 * connected models behind this console, not a generic particle-field
 * backdrop. Nodes gently drift, edges fade in/out by distance, four "hub"
 * nodes pulse in each instrument's accent color.
 */
export default function NeuralField({ nodeCount = 46, className = "", height = 360 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height2 = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height2 = rect.height;
      canvas.width = width * dpr;
      canvas.height = height2 * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height2 + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const isHub = i < 4;
      return {
        x: Math.random() * width,
        y: Math.random() * height2,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: isHub ? 3.4 : 1.4 + Math.random() * 1.2,
        hub: isHub,
        color: isHub ? ACCENTS[i] : "#8b8770",
        phase: Math.random() * Math.PI * 2,
      };
    });

    const LINK_DIST = 130;

    const draw = () => {
      ctx.clearRect(0, 0, width, height2);

      for (const n of nodes) {
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height2) n.vy *= -1;
          n.phase += 0.02;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * (a.hub || b.hub ? 0.32 : 0.14);
            ctx.strokeStyle = `rgba(77, 83, 71, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const pulse = n.hub ? 1 + Math.sin(n.phase) * 0.25 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.hub ? 0.85 : 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [nodeCount]);

  return (
    <div className={"neural-field " + className} style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
