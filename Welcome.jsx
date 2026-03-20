import { useState, useEffect } from "react";

const animals = [
  { emoji: "🐨", name: "Koala", color: "#C8E6C9", accent: "#A5D6A7", msg: "Let's study together!" },
  { emoji: "🐼", name: "Panda", color: "#F8BBD0", accent: "#F48FB1", msg: "You can do it!" },
  { emoji: "🦊", name: "Foxy", color: "#FFE0B2", accent: "#FFCC80", msg: "Stay curious!" },
  { emoji: "🐶", name: "Puppy", color: "#DCEDC8", accent: "#C5E1A5", msg: "One hop at a time!" },
  { emoji: "🐰", name: "Bunny", color: "#E1BEE7", accent: "#CE93D8", msg: "Focus & flow!" },
  { emoji: "🐻", name: "Bear", color: "#D7CCC8", accent: "#BCAAA4", msg: "Be steady!" },
];

const FloatingBubble = ({ style, children }) => (
  <div style={{
    position: "absolute",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: style.fontSize || "1.6rem",
    animation: `float ${style.duration || 4}s ease-in-out infinite`,
    animationDelay: style.delay || "0s",
    zIndex: 0,
    ...style,
  }}>{children}</div>
);

const AnimalCard = ({ animal, isActive, onClick, index }) => (
  <div
    onClick={() => onClick(index)}
    style={{
      cursor: "pointer",
      padding: "12px 16px",
      borderRadius: "20px",
      background: isActive ? animal.color : "rgba(255,255,255,0.55)",
      border: isActive ? `2.5px solid ${animal.accent}` : "2.5px solid transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      transform: isActive ? "scale(1.12) translateY(-4px)" : "scale(1)",
      boxShadow: isActive ? `0 8px 24px ${animal.accent}66` : "0 2px 10px rgba(0,0,0,0.06)",
      backdropFilter: "blur(8px)",
      minWidth: "72px",
    }}
  >
    <span style={{ fontSize: "2rem", lineHeight: 1 }}>{animal.emoji}</span>
    <span style={{
      fontSize: "0.65rem",
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 700,
      color: "#6b5e7a",
      letterSpacing: "0.03em",
    }}>{animal.name}</span>
  </div>
);

export default function WelcomePage({ onEnter }) {
  const [selected, setSelected] = useState(0);
  const [waving, setWaving] = useState(false);
  const [entered, setEntered] = useState(false);

  const current = animals[selected];

  useEffect(() => {
    setWaving(true);
    const t = setTimeout(() => setWaving(false), 600);
    return () => clearTimeout(t);
  }, [selected]);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => onEnter && onEnter(current), 700);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }
        @keyframes floatAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-20deg); }
          40% { transform: rotate(20deg); }
          60% { transform: rotate(-15deg); }
          80% { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,150,220,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(200,150,220,0); }
        }
        @keyframes slideOut {
          to { opacity: 0; transform: scale(0.92) translateY(-20px); }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .enter-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
        }
        .enter-btn:hover {
          transform: scale(1.06) translateY(-2px) !important;
          box-shadow: 0 12px 36px rgba(180,120,220,0.35) !important;
        }
        .enter-btn:active {
          transform: scale(0.97) !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #fce4ec 0%, #f8bbd0 15%, #e8d5f5 40%, #d1e8ff 70%, #d4f5e9 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Nunito', sans-serif",
        position: "relative",
        overflow: "hidden",
        animation: entered ? "slideOut 0.6s ease forwards" : "none",
      }}>

        {/* Floating decorations */}
        <FloatingBubble style={{ width:70, height:70, top:"8%", left:"7%", duration:3.5, delay:"0s", fontSize:"2rem" }}>⭐</FloatingBubble>
        <FloatingBubble style={{ width:50, height:50, top:"15%", right:"10%", duration:4.2, delay:"0.6s", fontSize:"1.4rem" }}>📚</FloatingBubble>
        <FloatingBubble style={{ width:60, height:60, bottom:"18%", left:"5%", duration:5, delay:"1s", fontSize:"1.6rem" }}>🌸</FloatingBubble>
        <FloatingBubble style={{ width:55, height:55, bottom:"12%", right:"8%", duration:3.8, delay:"0.3s", fontSize:"1.5rem" }}>🌟</FloatingBubble>
        <FloatingBubble style={{ width:45, height:45, top:"40%", left:"3%", duration:4.6, delay:"1.5s", fontSize:"1.2rem" }}>🍀</FloatingBubble>
        <FloatingBubble style={{ width:48, height:48, top:"30%", right:"4%", duration:3.9, delay:"0.9s", fontSize:"1.3rem" }}>✏️</FloatingBubble>
        <FloatingBubble style={{ width:40, height:40, top:"60%", right:"15%", duration:5.2, delay:"2s", fontSize:"1.1rem" }}>💡</FloatingBubble>
        <FloatingBubble style={{ width:65, height:65, top:"5%", left:"40%", duration:4.1, delay:"0.4s", fontSize:"1.8rem" }}>🌈</FloatingBubble>

        {/* Soft blobs */}
        <div style={{
          position:"absolute", width:380, height:380,
          borderRadius:"50%",
          background:"rgba(255,255,255,0.2)",
          top:"-80px", left:"-80px",
          filter:"blur(40px)",
        }}/>
        <div style={{
          position:"absolute", width:300, height:300,
          borderRadius:"50%",
          background:"rgba(220,180,255,0.2)",
          bottom:"-60px", right:"-60px",
          filter:"blur(50px)",
        }}/>

        {/* Main card */}
        <div style={{
          zIndex:1,
          background:"rgba(255,255,255,0.62)",
          backdropFilter:"blur(20px)",
          borderRadius:"36px",
          padding:"48px 44px 44px",
          maxWidth:"480px",
          width:"90%",
          boxShadow:"0 20px 60px rgba(180,130,220,0.18), 0 2px 0 rgba(255,255,255,0.9) inset",
          border:"1.5px solid rgba(255,255,255,0.8)",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          gap:"0px",
          animation:"fadeSlideUp 0.7s ease both",
        }}>

          {/* Big animal display */}
          <div style={{
            width:120, height:120,
            borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%, white 0%, ${current.color} 60%)`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:"4rem",
            boxShadow:`0 8px 32px ${current.accent}55`,
            marginBottom:"16px",
            animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            key: selected,
            border:`3px solid ${current.accent}`,
            transition:"background 0.4s, box-shadow 0.4s, border 0.4s",
          }}>
            <span style={{
              display:"inline-block",
              animation: waving ? "wave 0.6s ease" : "none",
              transformOrigin:"70% 80%",
            }}>{current.emoji}</span>
          </div>

          {/* Speech bubble */}
          <div style={{
            background: current.color,
            borderRadius:"16px",
            padding:"8px 20px",
            marginBottom:"8px",
            position:"relative",
            boxShadow:`0 3px 12px ${current.accent}40`,
            transition:"background 0.4s",
          }}>
            <span style={{
              fontFamily:"'Nunito', sans-serif",
              fontWeight:700,
              fontSize:"0.85rem",
              color:"#5a4a6a",
            }}>"{current.msg}"</span>
            <div style={{
              position:"absolute",
              top:"-10px", left:"50%",
              transform:"translateX(-50%)",
              width:0, height:0,
              borderLeft:"8px solid transparent",
              borderRight:"8px solid transparent",
              borderBottom:`10px solid ${current.color}`,
              transition:"border-bottom-color 0.4s",
            }}/>
          </div>

          {/* App title */}
          <h1 style={{
            fontFamily:"'Baloo 2', cursive",
            fontSize:"2.6rem",
            fontWeight:800,
            color:"#6b3fa0",
            margin:"12px 0 4px",
            letterSpacing:"-0.5px",
            textAlign:"center",
            textShadow:"0 2px 0 rgba(180,130,220,0.15)",
          }}>StudyPaws 🐾</h1>

          <p style={{
            fontFamily:"'Nunito', sans-serif",
            fontSize:"1rem",
            fontWeight:600,
            color:"#9b8aaa",
            margin:"0 0 24px",
            textAlign:"center",
          }}>Your adorable study timer companion</p>

          {/* Animal picker */}
          <p style={{
            fontSize:"0.75rem",
            fontWeight:800,
            color:"#b8a8c8",
            letterSpacing:"0.1em",
            textTransform:"uppercase",
            marginBottom:"10px",
          }}>Choose your study buddy</p>

          <div style={{
            display:"flex",
            gap:"8px",
            flexWrap:"wrap",
            justifyContent:"center",
            marginBottom:"28px",
          }}>
            {animals.map((a, i) => (
              <AnimalCard
                key={i}
                animal={a}
                isActive={i === selected}
                onClick={setSelected}
                index={i}
              />
            ))}
          </div>

          {/* CTA button */}
          <button
            className="enter-btn"
            onClick={handleEnter}
            style={{
              background:"linear-gradient(135deg, #c084fc, #a855f7, #818cf8)",
              color:"white",
              border:"none",
              borderRadius:"50px",
              padding:"15px 48px",
              fontSize:"1.1rem",
              fontFamily:"'Baloo 2', cursive",
              fontWeight:700,
              cursor:"pointer",
              letterSpacing:"0.04em",
              boxShadow:"0 6px 24px rgba(168,85,247,0.4)",
              animation:"pulse 2.5s ease-in-out infinite",
              display:"flex",
              alignItems:"center",
              gap:"8px",
            }}
          >
            Let's Start Studying! 🚀
          </button>

          {/* Footer note */}
          <p style={{
            fontSize:"0.7rem",
            color:"#c0b0d0",
            marginTop:"16px",
            fontWeight:600,
            textAlign:"center",
          }}>
            🌟 Focus • Learn • Grow 🌟
          </p>
        </div>
      </div>
    </>
  );
}
