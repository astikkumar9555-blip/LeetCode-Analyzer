import "./ParallaxBackground.css";

// 1 = default fast, 1.5 = even faster, 0.6 = calmer
const SPEED = 1;

// layer: 0 = far (big, calm)  1 = middle  2 = near (small, quick)
// s = size px, t = top, l = left, inset = pressed-in look
// ox / oy = how far the circle floats on its own, dur = seconds for one float
const ORBS = [
  // far layer
  { layer: 0, s: 280, t: "35%", l: "-7%", inset: true, ox: 90,  oy: 70,  dur: 16 },
  { layer: 0, s: 200, t: "4%",  l: "8%",  ox: -70, oy: 90,  dur: 18 },
  { layer: 0, s: 130, t: "0%",  l: "50%", ox: 80,  oy: -60, dur: 14 },

  // middle layer
  { layer: 1, s: 160, t: "66%", l: "76%", ox: -110, oy: -80, dur: 12 },
  { layer: 1, s: 100, t: "72%", l: "12%", inset: true, ox: 100, oy: -90, dur: 11 },
  { layer: 1, s: 60,  t: "20%", l: "68%", ox: -90,  oy: 110, dur: 10 },
  { layer: 1, s: 80,  t: "48%", l: "88%", inset: true, ox: -70, oy: 80, dur: 13 },

  // near layer
  { layer: 2, s: 38,  t: "10%", l: "84%", ox: -130, oy: 100, dur: 8 },
  { layer: 2, s: 26,  t: "58%", l: "30%", ox: 110,  oy: -120, dur: 7 },
  { layer: 2, s: 70,  t: "84%", l: "50%", ox: -100, oy: -70, dur: 9 },
  { layer: 2, s: 44,  t: "30%", l: "22%", ox: 120,  oy: 90,  dur: 8 },
];

export default function ParallaxBackground() {
  return (
    <div className="parallax" aria-hidden="true" style={{ "--speed": SPEED }}>
      {[0, 1, 2].map((layer) => (
        <div key={layer} className={`layer layer-${layer}`}>
          <div className="layer-inner">
            {ORBS.filter((o) => o.layer === layer).map((o, i) => (
              <span
                key={i}
                className={`orb ${o.inset ? "inset" : ""}`}
                style={{
                  "--s": `${o.s}px`,
                  "--ox": `${o.ox}px`,
                  "--oy": `${o.oy}px`,
                  "--odur": `${o.dur / SPEED}s`,
                  top: o.t,
                  left: o.l,
                  animationDelay: `-${(i + 1) * 3.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}