import "./ParallaxBackground.css";

// layer: 0 = far (slow, small movement)  1 = middle  2 = near (faster, bigger movement)
// s = size px, t = top, l = left, inset = pressed-in look
// ox / oy = how far the circle floats on its own, dur = seconds for one float (bigger = slower)
const ORBS = [
  { layer: 0, s: 280, t: "35%", l: "-7%", inset: true, ox: 40,  oy: 30,  dur: 46 },
  { layer: 0, s: 200, t: "4%",  l: "8%",  ox: -30, oy: 40,  dur: 52 },
  { layer: 0, s: 130, t: "0%",  l: "50%", ox: 35,  oy: -25, dur: 40 },

  { layer: 1, s: 160, t: "66%", l: "76%", ox: -50, oy: -35, dur: 34 },
  { layer: 1, s: 100, t: "72%", l: "12%", inset: true, ox: 45, oy: -40, dur: 30 },
  { layer: 1, s: 60,  t: "20%", l: "68%", ox: -40, oy: 50,  dur: 28 },

  { layer: 2, s: 38,  t: "10%", l: "84%", ox: -60, oy: 45,  dur: 22 },
  { layer: 2, s: 26,  t: "58%", l: "30%", ox: 50,  oy: -55, dur: 20 },
  { layer: 2, s: 70,  t: "84%", l: "50%", ox: -45, oy: -30, dur: 26 },
];

export default function ParallaxBackground() {
  return (
    <div className="parallax" aria-hidden="true">
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
                  "--odur": `${o.dur}s`,
                  top: o.t,
                  left: o.l,
                  animationDelay: `-${(i + 1) * 7}s`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}