import { useMemo } from "react";
import styles from "./MemorySphere.module.css";

interface NodeDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface Props {
  nodes: NodeDef[];
  petName: string;
  activeNode: string | null;
  thinking: boolean;
  memCount: (id: string) => number;
}

export default function MemorySphere({ nodes, petName, activeNode, thinking, memCount }: Props) {
  // Distribute nodes across 3 orbital rings
  const orbits: NodeDef[][] = useMemo(() => {
    const o: NodeDef[][] = [[], [], []];
    nodes.forEach((n, i) => o[i % 3].push(n));
    return o;
  }, [nodes]);

  return (
    <div className={`${styles.scene} ${thinking ? styles.thinking : ""}`}>
      {/* Ambient glow */}
      <div className={styles.ambientGlow} />

      {/* Center orb — the pet's brain */}
      <div className={styles.centerOrb}>
        <div className={styles.centerInner}>
          <span className={styles.centerIcon}>🐾</span>
          <span className={styles.centerLabel}>{petName}</span>
        </div>
        <div className={styles.centerPulse} />
        <div className={styles.centerPulse2} />
      </div>

      {/* Orbital rings with nodes */}
      {orbits.map((ring, ri) => (
        <div
          key={ri}
          className={`${styles.orbit} ${styles[`orbit${ri}`]}`}
        >
          {/* The ring track line */}
          <div className={styles.orbitTrack} />

          {/* Nodes on this ring */}
          {ring.map((node, ni) => {
            const angle = (360 / ring.length) * ni;
            const isActive = activeNode === node.id;
            const count = memCount(node.id);
            return (
              <div
                key={node.id}
                className={`${styles.nodeWrapper} ${isActive ? styles.nodeActive : ""}`}
                style={{
                  "--angle": `${angle}deg`,
                  "--color": node.color,
                } as React.CSSProperties}
              >
                <div className={styles.nodeCard}>
                  {isActive && <div className={styles.activeRing} />}
                  <div className={styles.nodeIcon}>{node.icon}</div>
                  <div className={styles.nodeLabel}>{node.label}</div>
                  {count > 0 && (
                    <div className={styles.nodeCount}>{count}</div>
                  )}
                </div>
                {/* Connector line to center */}
                <div className={styles.connector} />
                {/* Floating particle on connector */}
                <div className={`${styles.particle} ${isActive ? styles.particleFast : ""}`} />
              </div>
            );
          })}
        </div>
      ))}

      {/* Floating ambient dots */}
      {DOTS.map((d, i) => (
        <div key={i} className={styles.dot}
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.r, height: d.r,
            background: d.color,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

const DOTS = [
  { x: 12, y: 20, r: 6, color: "#a78bfa", delay: 0,   dur: 5  },
  { x: 80, y: 15, r: 5, color: "#f87171", delay: 1,   dur: 6  },
  { x: 88, y: 70, r: 8, color: "#34d399", delay: 0.5, dur: 7  },
  { x: 8,  y: 65, r: 5, color: "#fbbf24", delay: 1.5, dur: 5.5},
  { x: 50, y: 5,  r: 4, color: "#38bdf8", delay: 2,   dur: 8  },
  { x: 92, y: 42, r: 6, color: "#fb923c", delay: 0.3, dur: 6.5},
  { x: 5,  y: 42, r: 4, color: "#c084fc", delay: 1.8, dur: 7  },
  { x: 60, y: 90, r: 5, color: "#4ade80", delay: 0.8, dur: 5  },
];
