import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Wraps children in a card that tilts in true 3D (CSS perspective) toward
 * the cursor, with a soft glare highlight that tracks pointer position.
 * Springs back to rest smoothly on pointer leave.
 */
export default function TiltCard({ children, className = "", style = {}, maxTilt = 10, glare = true, as: As = "div" }) {
  const ref = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 220, damping: 22 });
  const springY = useSpring(y, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [0, 1], ["0%", "100%"]);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  const MotionAs = motion[As] || motion.div;

  return (
    <MotionAs
      ref={ref}
      className={"tilt-card " + className}
      style={{ ...style, rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {glare && (
        <motion.div
          className="tilt-glare"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 55%)`
            ),
          }}
        />
      )}
      <div className="tilt-card-content">{children}</div>
    </MotionAs>
  );
}
