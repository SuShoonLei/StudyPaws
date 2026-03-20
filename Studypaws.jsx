import { useState, useEffect, useRef } from "react";

const ANIMALS = {
  koala:  { emoji:"🐨", name:"Koala",  color:"#C8E6C9", accent:"#81C784", bg:"linear-gradient(160deg,#e8f5e9,#f1f8e9,#e0f2f1)", msg:"Let's study together!", food:"🍃", foodName:"Eucalyptus", scenes:[{label:"Stretching",frames:["🐨","🤸"],activity:"Morning stretch!"},{label:"Reading",frames:["📖🐨","🐨📖"],activity:"Deep in the books…"},{label:"Thinking",frames:["🐨💭","🤔🐨"],activity:"Processing ideas…"},{label:"Writing",frames:["✏️🐨","🐨✏️"],activity:"Taking notes…"},{label:"Snacking",frames:["🐨🍃","🌿🐨"],activity:"Eucalyptus break!"}], sleepMsg:"Zzz… good work! 🌙", hungerMsgs:["I'm hungry!","Feed me! 🍃","Eucalyptus please!"] },
  panda:  { emoji:"🐼", name:"Panda",  color:"#F8BBD0", accent:"#F48FB1", bg:"linear-gradient(160deg,#fce4ec,#fdf6fa,#f3e5f5)", msg:"You can do it!",  food:"🎋", foodName:"Bamboo",    scenes:[{label:"Stretching",frames:["🐼","🙆"],activity:"Morning stretch!"},{label:"Reading",frames:["📚🐼","🐼📚"],activity:"Reading bamboo scrolls…"},{label:"Thinking",frames:["🐼💭","🤔🐼"],activity:"Deep in thought…"},{label:"Writing",frames:["✏️🐼","🐼✏️"],activity:"Writing notes…"},{label:"Snacking",frames:["🐼🎋","🎋🐼"],activity:"Bamboo break!"}], sleepMsg:"Zzz… amazing! 🌸", hungerMsgs:["Need bamboo!","Feed me! 🎋","So hungry…"] },
  fox:    { emoji:"🦊", name:"Fox",    color:"#FFE0B2", accent:"#FFCC80", bg:"linear-gradient(160deg,#fff8e1,#fffde7,#fff3e0)", msg:"Stay curious!",   food:"🍇", foodName:"Berries",   scenes:[{label:"Stretching",frames:["🦊","🤸"],activity:"Foxy stretch!"},{label:"Research",frames:["🔍🦊","🦊🔍"],activity:"Investigating…"},{label:"Thinking",frames:["🦊💡","💡🦊"],activity:"A-ha moments…"},{label:"Writing",frames:["✏️🦊","🦊✏️"],activity:"Clever ideas…"},{label:"Break",frames:["🦊🍂","🍂🦊"],activity:"Forest break!"}], sleepMsg:"Zzz… clever fox! 🌙", hungerMsgs:["Berries please!","Feed me! 🍇","I'm starving!"] },
  puppy:  { emoji:"🐶", name:"Puppy",  color:"#FFF9C4", accent:"#F9A825", bg:"linear-gradient(160deg,#fffde7,#fff8e1,#fff3e0)", msg:"Woof! Let's go!",  food:"🦴", foodName:"Bones",    scenes:[{label:"Stretching",frames:["🐶","🤸"],activity:"Morning zoomies!"},{label:"Reading",frames:["📙🐶","🐶📙"],activity:"Studious pup…"},{label:"Thinking",frames:["🐶💭","💭🐶"],activity:"Woof… thinking…"},{label:"Writing",frames:["✏️🐶","🐶✏️"],activity:"Paw-writing notes…"},{label:"Break",frames:["🐶🎾","🎾🐶"],activity:"Ball break! Fetch!"}], sleepMsg:"Zzz… dreaming of bones! 🌙", hungerMsgs:["Want a bone!","Feed me! 🦴","Woof woof hungry!"] },
  bunny:  { emoji:"🐰", name:"Bunny",  color:"#E1BEE7", accent:"#CE93D8", bg:"linear-gradient(160deg,#f3e5f5,#fce4ec,#ede7f6)", msg:"Focus & flow!",   food:"🥕", foodName:"Carrots",  scenes:[{label:"Hopping",frames:["🐰","🐇"],activity:"Bouncing in!"},{label:"Reading",frames:["📕🐰","🐰📕"],activity:"Textbooks time!"},{label:"Thinking",frames:["🐰💭","💭🐰"],activity:"Bunny brain…"},{label:"Writing",frames:["✏️🐰","🐰✏️"],activity:"Scribble…"},{label:"Break",frames:["🐰🥕","🥕🐰"],activity:"Carrot break!"}], sleepMsg:"Zzz… fluffy dreams! 🌸", hungerMsgs:["Want carrots!","Feed me! 🥕","So hungry!"] },
  bear:   { emoji:"🐻", name:"Bear",   color:"#D7CCC8", accent:"#BCAAA4", bg:"linear-gradient(160deg,#efebe9,#fafafa,#f5f5f5)", msg:"Be steady!",      food:"🍯", foodName:"Honey",    scenes:[{label:"Roaring",frames:["🐻","🦁"],activity:"Grr let's go!"},{label:"Reading",frames:["📘🐻","🐻📘"],activity:"Bear study…"},{label:"Thinking",frames:["🐻💭","💭🐻"],activity:"Steady focus…"},{label:"Writing",frames:["✏️🐻","🐻✏️"],activity:"Paw-writing…"},{label:"Break",frames:["🐻🍯","🍯🐻"],activity:"Honey break!"}], sleepMsg:"Zzz… hibernating! 🌙", hungerMsgs:["Need honey!","Feed me! 🍯","Growl… hungry!"] },
};
const AKEYS = Object.keys(ANIMALS);
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f8f0ff}
@keyframes floatUp{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(5deg)}}
@keyframes wave{0%{transform:rotate(0)}20%{transform:rotate(-22deg)}40%{transform:rotate(22deg)}60%{transform:rotate(-14deg)}80%{transform:rotate(10deg)}100%{transform:rotate(0)}}
@keyframes pageIn{from{opacity:0;transform:translateY(22px) scale(0.97)}to{opacity:1;transform:none}}
@keyframes pageOut{to{opacity:0;transform:translateY(-22px) scale(0.97)}}
@keyframes popIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.07)}100%{transform:scale(1);opacity:1}}
@keyframes breathe{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.06)}}
@keyframes tickPulse{0%,100%{opacity:1}50%{opacity:.7}}
@keyframes shake{0%,100%{transform:translate(-50%,-50%) rotate(0)}20%{transform:translate(-50%,-50%) rotate(-9deg)}40%{transform:translate(-50%,-50%) rotate(9deg)}60%{transform:translate(-50%,-50%) rotate(-6deg)}80%{transform:translate(-50%,-50%) rotate(6deg)}}
@keyframes swing{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes fallIn{0%{opacity:0;transform:scale(0) translateY(-20px)}60%{transform:scale(1.2) translateY(4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes popCollect{0%{transform:scale(1);opacity:1}50%{transform:scale(1.8);opacity:.6}100%{transform:scale(0);opacity:0}}
@keyframes feedFloat{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-55px);opacity:0}}
@keyframes glowPulse{0%,100%{box-shadow:0 8px 32px rgba(255,200,80,0.3)}50%{box-shadow:0 8px 40px rgba(255,200,80,0.7)}}
@keyframes pulseShadow{0%,100%{box-shadow:0 6px 24px rgba(168,85,247,0.38)}50%{box-shadow:0 6px 36px rgba(168,85,247,0.6)}}
.pulse-btn{animation:pulseShadow 2.5s ease-in-out infinite;transition:transform .2s cubic-bezier(0.34,1.56,.64,1)!important}
.pulse-btn:hover,.btn-h:hover{transform:scale(1.05) translateY(-2px)!important}
.pulse-btn:active,.btn-h:active{transform:scale(0.97)!important}
.btn-h{transition:transform .2s cubic-bezier(0.34,1.56,.64,1)!important}
`;

const Blob = ({style,ch}) => (
  <div style={{position:"absolute",borderRadius:"50%",background:"rgba(255,255,255,0.3)",
    backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",
    animation:`floatUp ${style.d||4}s ease-in-out infinite`,animationDelay:style.dl||"0s",
    zIndex:0,fontSize:"1.5rem",...style}}>{ch}</div>
);

// ══════════════════════════════════════════════
//  SCREEN 1 — Welcome
// ══════════════════════════════════════════════
function Welcome({onEnter}) {
  const [sel,setSel]=useState("koala");
  const [waving,setWaving]=useState(false);
  const [out,setOut]=useState(false);
  const pick=k=>{setSel(k);setWaving(true);setTimeout(()=>setWaving(false),700)};
  const go=()=>{setOut(true);setTimeout(()=>onEnter(ANIMALS[sel]),560)};
  const a=ANIMALS[sel];
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fce4ec,#f8bbd0 15%,#e8d5f5 40%,#d1e8ff 70%,#d4f5e9)",
      display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",
      animation:out?"pageOut .55s ease forwards":"pageIn .6s ease both"}}>
      <Blob style={{width:68,height:68,top:"8%",left:"7%",d:3.5}} ch="⭐"/>
      <Blob style={{width:50,height:50,top:"14%",right:"9%",d:4.2,dl:"0.6s"}} ch="📚"/>
      <Blob style={{width:58,height:58,bottom:"17%",left:"5%",d:5,dl:"1s"}} ch="🌸"/>
      <Blob style={{width:54,height:54,bottom:"11%",right:"8%",d:3.8,dl:"0.3s"}} ch="🌟"/>
      <Blob style={{width:44,height:44,top:"42%",left:"3%",d:4.6,dl:"1.5s"}} ch="🍀"/>
      <Blob style={{width:46,height:46,top:"28%",right:"4%",d:3.9,dl:"0.9s"}} ch="✏️"/>

      <div style={{zIndex:1,background:"rgba(255,255,255,0.62)",backdropFilter:"blur(20px)",borderRadius:"36px",
        padding:"44px 40px 40px",maxWidth:"480px",width:"90%",
        boxShadow:"0 20px 60px rgba(180,130,220,0.18)",border:"1.5px solid rgba(255,255,255,0.8)",
        display:"flex",flexDirection:"column",alignItems:"center"}}>

        <div style={{width:118,height:118,borderRadius:"50%",
          background:`radial-gradient(circle at 35% 35%,white,${a.color} 60%)`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3.8rem",
          border:`3px solid ${a.accent}`,boxShadow:`0 8px 32px ${a.accent}55`,
          transition:"all .4s"}}>
          <span style={{display:"inline-block",animation:waving?"wave .65s ease":"none",transformOrigin:"70% 80%"}}>{a.emoji}</span>
        </div>

        <div style={{background:a.color,borderRadius:"14px",padding:"7px 18px",marginTop:"12px",position:"relative",
          boxShadow:`0 3px 12px ${a.accent}40`,transition:"background .4s"}}>
          <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:"0.82rem",color:"#5a4a6a"}}>"{a.msg}"</span>
          <div style={{position:"absolute",top:"-9px",left:"50%",transform:"translateX(-50%)",width:0,height:0,
            borderLeft:"7px solid transparent",borderRight:"7px solid transparent",
            borderBottom:`9px solid ${a.color}`,transition:"border-bottom-color .4s"}}/>
        </div>

        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:"2.5rem",fontWeight:800,color:"#6b3fa0",
          margin:"10px 0 2px",textAlign:"center"}}>StudyPaws 🐾</h1>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:"0.95rem",fontWeight:600,color:"#9b8aaa",margin:"0 0 22px",textAlign:"center"}}>
          Your adorable study timer companion</p>

        <p style={{fontSize:"0.72rem",fontWeight:800,color:"#b8a8c8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px"}}>
          Choose your study buddy</p>

        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center",marginBottom:"26px"}}>
          {AKEYS.map(k=>{const an=ANIMALS[k];const act=k===sel;return (
            <div key={k} onClick={()=>pick(k)} style={{cursor:"pointer",padding:"10px 14px",borderRadius:"18px",
              background:act?an.color:"rgba(255,255,255,0.55)",
              border:act?`2.5px solid ${an.accent}`:"2.5px solid transparent",
              display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",
              transition:"all .3s cubic-bezier(0.34,1.56,.64,1)",
              transform:act?"scale(1.12) translateY(-4px)":"scale(1)",
              boxShadow:act?`0 8px 24px ${an.accent}55`:"0 2px 8px rgba(0,0,0,0.05)",
              minWidth:"68px",backdropFilter:"blur(8px)"}}>
              <span style={{fontSize:"1.9rem",lineHeight:1}}>{an.emoji}</span>
              <span style={{fontSize:"0.63rem",fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#6b5e7a"}}>{an.name}</span>
            </div>);
          })}
        </div>

        <button onClick={go} className="pulse-btn" style={{background:"linear-gradient(135deg,#c084fc,#a855f7,#818cf8)",
          color:"white",border:"none",borderRadius:"50px",padding:"14px 46px",fontSize:"1.05rem",
          fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",letterSpacing:"0.04em",
          boxShadow:"0 6px 24px rgba(168,85,247,0.38)"}}>
          Let's Start Studying! 🚀
        </button>
        <p style={{fontSize:"0.68rem",color:"#c0b0d0",marginTop:"14px",fontWeight:600}}>🌟 Focus • Learn • Grow 🌟</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  SCREEN 2 — Study Timer
// ══════════════════════════════════════════════
function StudyTimer({animal,inventory,onDone,onBack}) {
  const DEF=25*60;
  const [total,setTotal]=useState(DEF);
  const [rem,setRem]=useState(DEF);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [si,setSi]=useState(0);
  const [fi,setFi]=useState(0);
  const [out,setOut]=useState(false);
  const [editing,setEditing]=useState(false);
  const [inputM,setInputM]=useState(25);
  const ir=useRef(); const sr=useRef(); const fr=useRef();
  const prog=1-rem/total; const R=80; const C=2*Math.PI*R;
  const totalFood=Object.values(inventory).reduce((a,b)=>a+b,0);

  const remRef=useRef(rem);
  useEffect(()=>{remRef.current=rem;},[rem]);
  useEffect(()=>{
    if(!running||done){clearInterval(ir.current);return;}
    const startTime=Date.now();
    const startRem=remRef.current;
    ir.current=setInterval(()=>{
      const next=startRem-Math.floor((Date.now()-startTime)/1000);
      if(next<=0){clearInterval(ir.current);setRem(0);setDone(true);setRunning(false);}
      else setRem(next);
    },500);
    return()=>clearInterval(ir.current);
  },[running,done]);
  useEffect(()=>{
    if(!running||done) return;
    sr.current=setInterval(()=>setSi(i=>(i+1)%animal.scenes.length),30000);
    return()=>clearInterval(sr.current);
  },[running,done]);
  useEffect(()=>{
    if(!running||done) return;
    fr.current=setInterval(()=>setFi(f=>f^1),900);
    return()=>clearInterval(fr.current);
  },[running,done]);

  const scene=animal.scenes[si];
  const disp=done?"😴 💤":running?scene.frames[fi]:animal.emoji;
  const reset=()=>{setRem(total);setDone(false);setRunning(false);setSi(0);setFi(0)};
  const applyM=m=>{const s=Math.max(1,Math.min(180,m))*60;setTotal(s);setRem(s);setDone(false);setRunning(false)};

  return (
    <div style={{minHeight:"100vh",background:animal.bg,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden",
      animation:out?"pageOut .55s ease forwards":"pageIn .6s ease both"}}>
      <Blob style={{width:52,height:52,top:"6%",left:"6%",d:3.8}} ch="📚"/>
      <Blob style={{width:44,height:44,top:"12%",right:"8%",d:4.3,dl:"0.5s"}} ch="✏️"/>
      <Blob style={{width:48,height:48,bottom:"14%",left:"6%",d:4.8,dl:"1.2s"}} ch="🌸"/>
      <Blob style={{width:44,height:44,bottom:"10%",right:"7%",d:3.5,dl:"0.8s"}} ch="💡"/>

      {/* Top bar */}
      <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",
        alignItems:"center",zIndex:5}}>
        <button onClick={()=>{setOut(true);setTimeout(onBack,550)}} style={{background:"rgba(255,255,255,0.65)",
          border:"none",borderRadius:"50px",padding:"8px 18px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",
          fontWeight:700,fontSize:"0.8rem",color:"#7a6a8a",boxShadow:"0 2px 10px rgba(0,0,0,0.08)"}}>← Back</button>
        <div style={{background:"rgba(255,255,255,0.72)",borderRadius:"50px",padding:"6px 16px",
          display:"flex",alignItems:"center",gap:"8px",boxShadow:"0 2px 10px rgba(0,0,0,0.08)",backdropFilter:"blur(8px)"}}>
          {AKEYS.map(k=>{const c=inventory[k]||0;if(!c) return null;
            return <span key={k} style={{fontSize:"0.78rem",fontWeight:700,color:"#6b5e7a"}}>{ANIMALS[k].food}×{c}</span>;
          })}
          {!totalFood&&<span style={{fontSize:"0.75rem",color:"#b8a8c8",fontWeight:600}}>No food yet</span>}
        </div>
      </div>

      <div style={{zIndex:1,background:"rgba(255,255,255,0.68)",backdropFilter:"blur(22px)",borderRadius:"40px",
        padding:"40px 38px 36px",maxWidth:"420px",width:"88%",
        boxShadow:`0 24px 64px ${animal.accent}33`,border:"1.5px solid rgba(255,255,255,0.85)",
        display:"flex",flexDirection:"column",alignItems:"center"}}>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
          <span style={{fontSize:"1.1rem"}}>{animal.emoji}</span>
          <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:"1.4rem",fontWeight:800,color:"#6b3fa0",margin:0}}>
            {animal.name}'s Study Session</h2>
        </div>

        <div style={{background:animal.color,borderRadius:"20px",padding:"5px 16px",marginBottom:"22px",
          boxShadow:`0 2px 8px ${animal.accent}33`,transition:"background .4s"}}>
          <span style={{fontSize:"0.78rem",fontWeight:700,color:"#5a4a6a"}}>
            {done?animal.sleepMsg:running?scene.activity:"Ready to study!"}</span>
        </div>

        <div style={{position:"relative",width:200,height:200,marginBottom:"20px"}}>
          <svg width="200" height="200" style={{position:"absolute",top:0,left:0}}>
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="12"/>
            <circle cx="100" cy="100" r={R} fill="none" stroke={animal.accent} strokeWidth="12"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-prog)}
              style={{transition:"stroke-dashoffset 1s linear",transform:"rotate(-90deg)",transformOrigin:"center"}}/>
          </svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:110,height:110,borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%,white,${animal.color} 65%)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.4rem",
            boxShadow:`0 6px 24px ${animal.accent}44`,border:`2.5px solid ${animal.accent}`,
            animation:done?"shake .6s ease .1s":running?"breathe 2s ease-in-out infinite":"none"}}>
            {disp}
          </div>
        </div>

        {editing?(
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"22px"}}>
            <input type="number" min={1} max={180} value={inputM} onChange={e=>setInputM(Number(e.target.value))}
              style={{width:"70px",textAlign:"center",fontSize:"1.6rem",fontFamily:"'Baloo 2',cursive",
                fontWeight:700,color:"#6b3fa0",border:`2px solid ${animal.accent}`,borderRadius:"12px",
                padding:"4px 8px",outline:"none",background:"rgba(255,255,255,0.8)"}}/>
            <span style={{fontFamily:"'Baloo 2',cursive",fontSize:"1rem",color:"#9b8aaa",fontWeight:700}}>min</span>
            <button onClick={()=>{applyM(inputM);setEditing(false)}} style={{background:animal.accent,
              border:"none",borderRadius:"10px",padding:"6px 14px",cursor:"pointer",
              fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"white",fontSize:"0.85rem"}}>Set</button>
          </div>
        ):(
          <div onClick={()=>{if(!running&&!done)setEditing(true)}}
            style={{cursor:!running&&!done?"pointer":"default",display:"flex",alignItems:"baseline",gap:"4px",
              marginBottom:"22px",padding:"8px 20px",borderRadius:"20px",
              background:!running&&!done?`${animal.color}88`:"transparent",transition:"background .3s"}}>
            <span style={{fontFamily:"'Baloo 2',cursive",fontSize:"3.4rem",fontWeight:800,
              color:done?"#aaa":"#5a3a8a",letterSpacing:"2px",
              animation:done?"none":running?"tickPulse 1s ease-in-out infinite":"none"}}>{fmt(rem)}</span>
            {!running&&!done&&<span style={{fontSize:"0.72rem",color:"#b8a8c8",fontWeight:700}}>✏️</span>}
          </div>
        )}

        <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
          {!done&&(
            <button onClick={()=>setRunning(r=>!r)} className="btn-h" style={{
              background:running?"linear-gradient(135deg,#f9a8d4,#f472b6)":`linear-gradient(135deg,${animal.accent},${animal.accent}cc)`,
              color:"white",border:"none",borderRadius:"50px",padding:"13px 36px",fontSize:"1rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",
              boxShadow:running?"0 4px 18px rgba(244,114,182,0.45)":`0 4px 18px ${animal.accent}55`}}>
              {running?"⏸ Pause":"▶ Start"}
            </button>
          )}
          <button onClick={reset} className="btn-h" style={{background:"rgba(255,255,255,0.7)",color:"#9b8aaa",
            border:`2px solid ${animal.accent}88`,borderRadius:"50px",padding:"12px 22px",fontSize:"0.95rem",
            fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer"}}>↺ Reset</button>
        </div>

        {done&&(
          <div style={{animation:"popIn .5s cubic-bezier(0.34,1.56,.64,1) both",width:"100%"}}>
            <div style={{background:animal.color,borderRadius:"20px",padding:"14px 24px",textAlign:"center",
              boxShadow:`0 4px 16px ${animal.accent}44`,marginBottom:"12px"}}>
              <p style={{fontFamily:"'Baloo 2',cursive",fontSize:"1.1rem",fontWeight:800,color:"#5a3a8a"}}>
                🎉 Session Complete!</p>
              <p style={{margin:"4px 0 0",fontSize:"0.8rem",color:"#7a6a8a",fontWeight:600}}>
                {animal.name} earned some rewards — go collect them!</p>
            </div>
            <button onClick={()=>{setOut(true);setTimeout(onDone,550)}} className="pulse-btn btn-h" style={{
              width:"100%",background:"linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)",
              color:"white",border:"none",borderRadius:"50px",padding:"14px",fontSize:"1.05rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",
              boxShadow:"0 6px 24px rgba(245,158,11,0.4)"}}>
              🎮 Collect Rewards! {animal.food}
            </button>
          </div>
        )}

        {!done&&(
          <div style={{display:"flex",gap:"6px",marginTop:"14px"}}>
            {animal.scenes.map((_,i)=>(
              <div key={i} style={{width:i===si?18:8,height:8,borderRadius:"4px",
                background:i===si?animal.accent:`${animal.accent}44`,transition:"all .4s"}}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  SCREEN 3 — Reward Game + Feed
// ══════════════════════════════════════════════
function RewardScreen({animal,inventory,setInventory,onHome}) {
  const GAME_T=20, SPAWN=1100, MAX=9;
  const [phase,setPhase]=useState("intro"); // intro | playing | result | feeding
  const [items,setItems]=useState([]);
  const [caught,setCaught]=useState(0);
  const [missed,setMissed]=useState(0);
  const [tLeft,setTLeft]=useState(GAME_T);
  const [popping,setPopping]=useState([]);
  const [feedAnims,setFeedAnims]=useState([]);
  const [happiness,setHappiness]=useState(0);
  const [out,setOut]=useState(false);
  const idR=useRef(0); const timerR=useRef(); const spawnR=useRef();
  const anKey=AKEYS.find(k=>ANIMALS[k]===animal)||"koala";
  const myFood=inventory[anKey]||0;
  const totalFood=Object.values(inventory).reduce((a,b)=>a+b,0);

  // countdown
  useEffect(()=>{
    if(phase!=="playing") return;
    timerR.current=setInterval(()=>{
      setTLeft(t=>{
        if(t<=1){clearInterval(timerR.current);clearInterval(spawnR.current);
          setItems([]);setPhase("result");return 0}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerR.current);
  },[phase]);

  // spawner
  useEffect(()=>{
    if(phase!=="playing") return;
    spawnR.current=setInterval(()=>{
      setItems(prev=>{
        if(prev.length>=MAX) return prev;
        const id=++idR.current;
        const x=8+Math.random()*84, y=8+Math.random()*74;
        setTimeout(()=>{
          setItems(p=>{
            const still=p.find(i=>i.id===id);
            if(still){setMissed(m=>m+1);}
            return p.filter(i=>i.id!==id);
          });
        },3200);
        return [...prev,{id,x,y}];
      });
    },SPAWN);
    return()=>clearInterval(spawnR.current);
  },[phase]);

  const tapItem=(id,e)=>{
    e.stopPropagation();
    setPopping(p=>[...p,id]);
    setTimeout(()=>{
      setPopping(p=>p.filter(x=>x!==id));
      setItems(p=>p.filter(i=>i.id!==id));
      setCaught(c=>c+1);
    },300);
  };

  const saveLoot=()=>{
    if(caught>0) setInventory(prev=>({...prev,[anKey]:(prev[anKey]||0)+caught}));
    setPhase("feeding");
  };

  const feedPet=()=>{
    if(myFood<=0) return;
    setInventory(prev=>({...prev,[anKey]:Math.max(0,(prev[anKey]||0)-1)}));
    setHappiness(h=>Math.min(100,h+20));
    const fid=Date.now();
    setFeedAnims(a=>[...a,{id:fid,x:35+Math.random()*30}]);
    setTimeout(()=>setFeedAnims(a=>a.filter(f=>f.id!==fid)),900);
  };

  const startGame=()=>{
    setItems([]); setCaught(0); setMissed(0); setTLeft(GAME_T);
    setPopping([]); setPhase("playing");
  };

  const happyEmoji=happiness>=80?"😄":happiness>=60?"😊":happiness>=40?"🙂":happiness>=20?"😐":"😕";
  const happyMsg=happiness>=80?"So happy! 💖":happiness>=60?"Loving it!":happiness>=40?"Feeling good~":happiness>=20?"Getting better!":"Still hungry…";

  return (
    <div style={{minHeight:"100vh",background:animal.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",
      animation:out?"pageOut .55s ease forwards":"pageIn .6s ease both",padding:"16px"}}>

      <Blob style={{width:50,height:50,top:"4%",left:"4%",d:3.8}} ch="🎮"/>
      <Blob style={{width:44,height:44,top:"8%",right:"5%",d:4.3,dl:"0.5s"}} ch="🌟"/>
      <Blob style={{width:46,height:46,bottom:"10%",left:"3%",d:4.8,dl:"1.2s"}} ch="🎉"/>
      <Blob style={{width:42,height:42,bottom:"6%",right:"4%",d:3.5,dl:"0.8s"}} ch="✨"/>

      {/* ── FOOD INVENTORY BAR ── */}
      <div style={{position:"absolute",top:14,left:14,right:14,zIndex:10,
        background:"rgba(255,255,255,0.78)",backdropFilter:"blur(14px)",borderRadius:"22px",
        padding:"10px 16px",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1.5px solid rgba(255,255,255,0.9)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
          <span style={{fontSize:"0.68rem",fontWeight:800,color:"#b8a8c8",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            🍱 Food Inventory
          </span>
          <span style={{fontSize:"0.68rem",fontWeight:700,color:"#9b8aaa"}}>{totalFood} total</span>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"8px"}}>
          {AKEYS.map(k=>{
            const an=ANIMALS[k]; const count=inventory[k]||0; const isMe=k===anKey;
            return (
              <div key={k} style={{display:"flex",alignItems:"center",gap:"3px",
                background:isMe?an.color:"rgba(0,0,0,0.04)",
                borderRadius:"12px",padding:"3px 10px",
                border:isMe?`1.5px solid ${an.accent}`:"1.5px solid transparent",transition:"all .3s"}}>
                <span style={{fontSize:"1rem"}}>{an.food}</span>
                <span style={{fontSize:"0.72rem",fontWeight:800,color:isMe?"#5a3a8a":"#9b8aaa"}}>×{count}</span>
              </div>
            );
          })}
        </div>
        {/* progress bar for current pet */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
            <span style={{fontSize:"0.65rem",fontWeight:700,color:"#9b8aaa"}}>{animal.name}'s {animal.foodName}</span>
            <span style={{fontSize:"0.65rem",fontWeight:700,color:animal.accent}}>{myFood}/20</span>
          </div>
          <div style={{background:"rgba(0,0,0,0.08)",borderRadius:"8px",height:"7px",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:"8px",
              background:`linear-gradient(90deg,${animal.color},${animal.accent})`,
              width:`${Math.min(100,(myFood/20)*100)}%`,transition:"width .5s ease"}}/>
          </div>
        </div>
      </div>

      {/* ── INTRO ── */}
      {phase==="intro"&&(
        <div style={{zIndex:1,background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px)",borderRadius:"36px",
          padding:"34px 34px 28px",maxWidth:"420px",width:"92%",
          boxShadow:`0 20px 60px ${animal.accent}33`,border:"1.5px solid rgba(255,255,255,0.85)",
          display:"flex",flexDirection:"column",alignItems:"center",marginTop:"120px"}}>

          <div style={{fontSize:"4rem",display:"inline-block",animation:"swing 1.6s ease-in-out infinite",
            transformOrigin:"50% 0%",marginBottom:"10px"}}>{animal.food}</div>

          <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:"1.75rem",fontWeight:800,color:"#6b3fa0",
            textAlign:"center",margin:"0 0 6px"}}>Reward Time! 🎉</h2>
          <p style={{fontSize:"0.88rem",fontWeight:700,color:"#9b8aaa",textAlign:"center",margin:"0 0 12px"}}>
            {animal.name} earned a treat for all that hard work!</p>
          <div style={{background:animal.color,borderRadius:"16px",padding:"12px 20px",marginBottom:"20px",
            textAlign:"center",width:"100%",boxShadow:`0 2px 10px ${animal.accent}30`}}>
            <p style={{fontSize:"0.82rem",fontWeight:700,color:"#5a4a6a",lineHeight:1.7,margin:0}}>
              🎮 Tap the falling <b>{animal.foodName}</b> {animal.food} before they vanish<br/>
              ⏱️ You have <b>{GAME_T} seconds</b> — collect as many as you can!<br/>
              🐾 Feed your pet with what you collect!
            </p>
          </div>
          <button onClick={startGame} className="pulse-btn btn-h" style={{
            background:"linear-gradient(135deg,#a78bfa,#8b5cf6,#7c3aed)",
            color:"white",border:"none",borderRadius:"50px",padding:"14px 52px",fontSize:"1.1rem",
            fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",
            boxShadow:"0 6px 24px rgba(139,92,246,0.45)",marginBottom:"10px"}}>
            🎮 Start Catching!
          </button>
          <button onClick={()=>setPhase("feeding")} style={{background:"transparent",border:"none",cursor:"pointer",
            fontSize:"0.78rem",fontWeight:700,color:"#c0b0d0",fontFamily:"'Nunito',sans-serif"}}>
            Skip → Feed {animal.name}</button>
        </div>
      )}

      {/* ── PLAYING ── */}
      {phase==="playing"&&(
        <div style={{zIndex:1,width:"92%",maxWidth:"440px",marginTop:"120px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",
            background:"rgba(255,255,255,0.72)",backdropFilter:"blur(12px)",borderRadius:"20px",padding:"10px 20px"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.62rem",fontWeight:800,color:"#b8a8c8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Caught</div>
              <div style={{fontSize:"1.6rem",fontFamily:"'Baloo 2',cursive",fontWeight:800,color:"#6b3fa0"}}>{caught}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.62rem",fontWeight:800,color:"#b8a8c8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Time</div>
              <div style={{fontSize:"1.6rem",fontFamily:"'Baloo 2',cursive",fontWeight:800,
                color:tLeft<=5?"#ef4444":"#6b3fa0"}}>{tLeft}s</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.62rem",fontWeight:800,color:"#b8a8c8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Missed</div>
              <div style={{fontSize:"1.6rem",fontFamily:"'Baloo 2',cursive",fontWeight:800,color:"#f87171"}}>{missed}</div>
            </div>
          </div>

          {/* Game arena */}
          <div style={{position:"relative",width:"100%",height:"320px",
            background:"rgba(255,255,255,0.58)",backdropFilter:"blur(10px)",
            borderRadius:"28px",border:"1.5px solid rgba(255,255,255,0.85)",overflow:"hidden",
            boxShadow:`0 8px 32px ${animal.accent}22`}}>

            {/* timer bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"5px",background:"rgba(0,0,0,0.07)",zIndex:5}}>
              <div style={{height:"100%",background:tLeft<=5?"#ef4444":animal.accent,
                width:`${(tLeft/GAME_T)*100}%`,transition:"width 1s linear",borderRadius:"3px"}}/>
            </div>

            {/* ghost animal bg */}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              fontSize:"8rem",opacity:0.06,userSelect:"none",pointerEvents:"none",lineHeight:1}}>
              {animal.emoji}
            </div>

            {items.map(item=>(
              <div key={item.id} onClick={e=>tapItem(item.id,e)}
                style={{position:"absolute",left:`${item.x}%`,top:`${item.y}%`,
                  fontSize:"2.2rem",cursor:"pointer",userSelect:"none",zIndex:4,
                  animation:popping.includes(item.id)?"popCollect .3s ease forwards":"fallIn .45s cubic-bezier(0.34,1.56,.64,1) both",
                  filter:"drop-shadow(0 2px 5px rgba(0,0,0,0.18))",
                  transition:"filter .1s",
                }}>
                {animal.food}
              </div>
            ))}

            <div style={{position:"absolute",bottom:"10px",left:"50%",transform:"translateX(-50%)",
              fontSize:"0.72rem",fontWeight:700,color:"rgba(140,110,170,0.55)",whiteSpace:"nowrap",userSelect:"none"}}>
              Tap the {animal.foodName}! {animal.food}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase==="result"&&(
        <div style={{zIndex:1,background:"rgba(255,255,255,0.72)",backdropFilter:"blur(20px)",borderRadius:"36px",
          padding:"34px 34px 28px",maxWidth:"420px",width:"92%",
          boxShadow:`0 20px 60px ${animal.accent}33`,border:"1.5px solid rgba(255,255,255,0.85)",
          display:"flex",flexDirection:"column",alignItems:"center",marginTop:"120px",
          animation:"popIn .5s cubic-bezier(0.34,1.56,.64,1) both"}}>

          <div style={{fontSize:"4.5rem",marginBottom:"8px",animation:"popIn .6s .1s both"}}>{animal.food}</div>
          <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:"1.8rem",fontWeight:800,color:"#6b3fa0",
            textAlign:"center",margin:"0 0 6px"}}>Time's Up! ⏰</h2>

          <div style={{display:"flex",gap:"16px",margin:"16px 0"}}>
            {[["🎯 Caught",caught,"#6b3fa0"],["💨 Missed",missed,"#f87171"]].map(([lbl,val,col])=>(
              <div key={lbl} style={{flex:1,background:animal.color,borderRadius:"20px",padding:"14px",textAlign:"center",
                boxShadow:`0 3px 12px ${animal.accent}30`}}>
                <div style={{fontSize:"0.72rem",fontWeight:800,color:"#9b8aaa",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>{lbl}</div>
                <div style={{fontSize:"2rem",fontFamily:"'Baloo 2',cursive",fontWeight:800,color:col}}>{val}</div>
              </div>
            ))}
          </div>

          {caught>0&&(
            <p style={{fontSize:"0.88rem",fontWeight:700,color:"#7a6a8a",textAlign:"center",margin:"0 0 18px"}}>
              You earned <b style={{color:animal.accent}}>{caught} {animal.food} {animal.foodName}</b>!<br/>
              Go feed {animal.name}! 🐾
            </p>
          )}
          {caught===0&&(
            <p style={{fontSize:"0.88rem",fontWeight:700,color:"#b8a8c8",textAlign:"center",margin:"0 0 18px"}}>
              No worries, try again next time! 🌸</p>
          )}

          <div style={{display:"flex",gap:"10px",width:"100%"}}>
            <button onClick={startGame} className="btn-h" style={{flex:1,
              background:"rgba(255,255,255,0.8)",color:"#7a6a8a",
              border:`2px solid ${animal.accent}88`,borderRadius:"50px",padding:"12px",fontSize:"0.9rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer"}}>↺ Try Again</button>
            <button onClick={saveLoot} className="pulse-btn btn-h" style={{flex:1.5,
              background:`linear-gradient(135deg,${animal.accent},${animal.accent}cc)`,
              color:"white",border:"none",borderRadius:"50px",padding:"12px",fontSize:"0.9rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",
              boxShadow:`0 4px 18px ${animal.accent}55`}}>
              Feed {animal.emoji} {animal.name}!
            </button>
          </div>
        </div>
      )}

      {/* ── FEEDING ── */}
      {phase==="feeding"&&(
        <div style={{zIndex:1,background:"rgba(255,255,255,0.72)",backdropFilter:"blur(20px)",borderRadius:"36px",
          padding:"32px 32px 26px",maxWidth:"420px",width:"92%",
          boxShadow:`0 20px 60px ${animal.accent}33`,border:"1.5px solid rgba(255,255,255,0.85)",
          display:"flex",flexDirection:"column",alignItems:"center",marginTop:"120px"}}>

          <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:"1.6rem",fontWeight:800,color:"#6b3fa0",
            margin:"0 0 4px",textAlign:"center"}}>Feed {animal.name}! {animal.emoji}</h2>
          <p style={{fontSize:"0.82rem",fontWeight:600,color:"#9b8aaa",margin:"0 0 18px",textAlign:"center"}}>
            You have <b style={{color:animal.accent}}>{myFood} {animal.food}</b> {animal.foodName}</p>

          {/* pet */}
          <div style={{position:"relative",marginBottom:"16px"}}>
            <div style={{width:130,height:130,borderRadius:"50%",
              background:`radial-gradient(circle at 35% 35%,white,${animal.color} 65%)`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3.6rem",
              border:`3px solid ${animal.accent}`,
              boxShadow:happiness>=80?`0 8px 32px ${animal.accent}55, 0 0 0 0 rgba(255,200,80,0.5)`:`0 8px 32px ${animal.accent}44`,
              animation:happiness>=80?"glowPulse 1.8s ease-in-out infinite":"none",
              transition:"all .4s"}}>
              {happiness>=80?"😄":happiness>=40?"😊":animal.emoji}
            </div>
            {/* speech bubble */}
            <div style={{position:"absolute",top:"-6px",right:"-64px",background:"white",
              borderRadius:"12px",padding:"5px 10px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
              border:"1.5px solid rgba(0,0,0,0.06)",whiteSpace:"nowrap",zIndex:2}}>
              <span style={{fontSize:"0.68rem",fontWeight:700,color:"#6b5e7a"}}>
                {happiness>=80?"I'm so full! 😌":myFood>0?animal.hungerMsgs[0]:"All done! 😌"}
              </span>
            </div>
            {feedAnims.map(f=>(
              <div key={f.id} style={{position:"absolute",left:`${f.x}%`,top:"5%",
                fontSize:"1.8rem",animation:"feedFloat .9s ease forwards",
                pointerEvents:"none",zIndex:10}}>{animal.food}</div>
            ))}
          </div>

          {/* happiness bar */}
          <div style={{width:"100%",marginBottom:"18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
              <span style={{fontSize:"0.7rem",fontWeight:800,color:"#b8a8c8",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Happiness {happyEmoji}
              </span>
              <span style={{fontSize:"0.7rem",fontWeight:700,color:animal.accent}}>{happyMsg}</span>
            </div>
            <div style={{background:"rgba(0,0,0,0.08)",borderRadius:"12px",height:"14px",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:"12px",
                background:`linear-gradient(90deg,${animal.color},${animal.accent})`,
                width:`${happiness}%`,transition:"width .6s cubic-bezier(0.34,1.56,.64,1)"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:"3px"}}>
              <span style={{fontSize:"0.62rem",color:"#d0c0e0"}}>😕</span>
              <span style={{fontSize:"0.62rem",color:"#d0c0e0"}}>😄</span>
            </div>
          </div>

          <button onClick={feedPet} disabled={myFood<=0} className="btn-h" style={{
            background:myFood>0?`linear-gradient(135deg,${animal.accent},${animal.accent}cc)`:"rgba(0,0,0,0.09)",
            color:myFood>0?"white":"#ccc",border:"none",borderRadius:"50px",
            padding:"13px 40px",fontSize:"1rem",fontFamily:"'Baloo 2',cursive",fontWeight:700,
            cursor:myFood>0?"pointer":"not-allowed",
            boxShadow:myFood>0?`0 6px 20px ${animal.accent}55`:"none",
            marginBottom:"12px",transition:"all .25s",width:"100%"}}>
            {animal.food} Feed {animal.name}! {myFood<=0?"(No food left)":""}
          </button>

          {myFood<=0&&(
            <p style={{fontSize:"0.78rem",fontWeight:700,color:"#f87171",textAlign:"center",margin:"0 0 10px"}}>
              No {animal.foodName} left! Play the game to collect more 🎮</p>
          )}

          <div style={{display:"flex",gap:"10px",width:"100%"}}>
            <button onClick={()=>setPhase("intro")} className="btn-h" style={{flex:1,
              background:"rgba(255,255,255,0.8)",color:"#9b8aaa",
              border:`2px solid ${animal.accent}88`,borderRadius:"50px",padding:"10px",fontSize:"0.85rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer"}}>🎮 Play Again</button>
            <button onClick={()=>{setOut(true);setTimeout(onHome,550)}} className="btn-h" style={{flex:1,
              background:"linear-gradient(135deg,#c084fc,#a855f7)",color:"white",
              border:"none",borderRadius:"50px",padding:"10px",fontSize:"0.85rem",
              fontFamily:"'Baloo 2',cursive",fontWeight:700,cursor:"pointer",
              boxShadow:"0 4px 16px rgba(168,85,247,0.4)"}}>🏠 Home</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
//  Root App
// ══════════════════════════════════════════════
export default function App() {
  const [screen,setScreen]=useState("welcome");
  const [animal,setAnimal]=useState(null);
  const [inventory,setInventory]=useState({koala:0,panda:0,fox:0,puppy:0,bunny:0,bear:0});

  return (
    <>
      <style>{CSS}</style>
      {screen==="welcome"&&<Welcome onEnter={a=>{setAnimal(a);setScreen("study")}}/>}
      {screen==="study"&&animal&&(
        <StudyTimer animal={animal} inventory={inventory}
          onDone={()=>setScreen("reward")} onBack={()=>setScreen("welcome")}/>
      )}
      {screen==="reward"&&animal&&(
        <RewardScreen animal={animal} inventory={inventory} setInventory={setInventory}
          onHome={()=>setScreen("welcome")}/>
      )}
    </>
  );
}
