import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:"#09111E", surface:"#0E1A2B", card:"#132035", border:"#1C2E42",
  gold:"#D4A853", goldDim:"#D4A85325", text:"#EAE6DE", soft:"#7A8FA6",
  muted:"#3A4F63", eff:"#10B981", care:"#EC4899", resp:"#3B82F6",
  wl:"#8B5CF6", high:"#EF4444", mod:"#F59E0B", low:"#10B981",
};

const DOMAIN = {
  Safe:       { color:"#F59E0B" }, Effective: { color:"#10B981" },
  Caring:     { color:"#EC4899" }, Responsive:{ color:"#3B82F6" },
  "Well-Led": { color:"#8B5CF6" },
};

const MOOD_C = {
  Happy:"#10B981",Calm:"#3B82F6",Agitated:"#F59E0B",
  Distressed:"#EF4444",Confused:"#8B5CF6",Withdrawn:"#6B7280",
};

const RISK_C = { high:"#EF4444", moderate:"#F59E0B", low:"#10B981", none:"#10B981" };

const RATING_C = {
  Outstanding:"#3B82F6", Good:"#10B981",
  "Requires Improvement":"#F59E0B", Inadequate:"#EF4444",
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLES & NAV
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = {
  carer:      { label:"Care Staff",         color:"#10B981", badge:"CARER",      access:["notes"]                                                              },
  senior:     { label:"Senior Carer",       color:"#3B82F6", badge:"SENIOR",     access:["notes","dashboard"]                                                  },
  manager:    { label:"Registered Manager", color:"#D4A853", badge:"MANAGER",    access:["notes","dashboard","evidence","residents","staff"]    },
  compliance: { label:"Compliance Officer", color:"#8B5CF6", badge:"COMPLIANCE", access:["notes","dashboard","evidence","residents","staff"]    },
};

const NAV = [
  { id:"dashboard", icon:"◈", label:"Dashboard"  },
  { id:"notes",     icon:"◎", label:"Notes"        },
  { id:"residents", icon:"◉", label:"Residents"   },
  { id:"evidence",  icon:"◻", label:"Evidence"    },
  { id:"staff",     icon:"◷", label:"Staff"       },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const TD = new Date().toISOString().split("T")[0];

const SEED_STAFF = [
  { id:1, name:"Sarah Thompson", role:"carer",      pin:"1234", active:true, lastLogin:"Today 08:14", keyWorkers:[1,4], initials:"ST" },
  { id:2, name:"Mike Richards",  role:"carer",      pin:"2345", active:true, lastLogin:"Today 07:52", keyWorkers:[2,5], initials:"MR" },
  { id:3, name:"Claire Barnes",  role:"senior",     pin:"3456", active:true, lastLogin:"Today 09:01", keyWorkers:[3],   initials:"CB" },
  { id:4, name:"James Okafor",   role:"manager",    pin:"4567", active:true, lastLogin:"Yesterday",   keyWorkers:[],    initials:"JO" },
  { id:5, name:"Priya Patel",    role:"compliance", pin:"5678", active:true, lastLogin:"Today 09:30", keyWorkers:[],    initials:"PP" },
];

const SEED_RESIDENTS = [
  { id:1, name:"Mary Jones",  room:"12A", age:84, conditions:["Type 2 Diabetes","Vascular Dementia"],   preferences:"Prefers tea. Enjoys Classic FM.", family:"Daughter Patricia (Sundays)" },
  { id:2, name:"John Patel",  room:"07B", age:78, conditions:["Parkinson's Disease","Osteoporosis"],    preferences:"Prefers shower. Enjoys cricket.",  family:"Son Raj (Fridays)"           },
  { id:3, name:"Agnes Webb",  room:"03A", age:91, conditions:["Advanced Dementia","Atrial Fibrillation"],preferences:"Responds to 1950s music.",        family:"Daughter Helen (irregular)"  },
  { id:4, name:"Robert Shaw", room:"15C", age:76, conditions:["COPD","Type 2 Diabetes"],                preferences:"Enjoys gardening TV.",             family:"Wife Margaret (daily calls)" },
  { id:5, name:"Edith Crane", room:"09B", age:88, conditions:["Heart Failure","Osteoporosis"],          preferences:"Enjoys crosswords. Tea 2 sugars.", family:"Son David (Wednesdays)"      },
];

const SEED_SHIFTS = [
  { id:1, date:TD, shift:"morning",   label:"Morning Shift",   time:"07:00–14:30", status:"active",   assignments:[{staffId:1,residentIds:[1,4]},{staffId:2,residentIds:[2,5]},{staffId:3,residentIds:[1,2,3,4,5]}] },
  { id:2, date:TD, shift:"afternoon", label:"Afternoon Shift", time:"14:00–21:30", status:"upcoming", assignments:[{staffId:2,residentIds:[1,3]},{staffId:1,residentIds:[2,4,5]}] },
  { id:3, date:TD, shift:"night",      label:"Night Shift",      time:"21:00–07:30", status:"upcoming", assignments:[{staffId:1,residentIds:[1,2,3,4,5]}] },
];

const SEED_NOTES = [
  { id:1, residentId:1, ts:new Date(Date.now()-2*3600000).toISOString(), resident_name:"Mary Jones",  observation:"Refused morning medication — stomach upset.", action_taken:"Nurse informed. Monitoring increased.", mood:"Agitated",   risk_flags:[{type:"medication_refusal",severity:"high",detail:"Refused prescribed medication"}], cqc_domains:["Safe","Effective"], follow_up_required:true  },
  { id:2, residentId:2, ts:new Date(Date.now()-5*3600000).toISOString(), resident_name:"John Patel",  observation:"Found on floor near bathroom, no injuries.",  action_taken:"Assisted to chair. Nurse called. Incident form completed.", mood:"Distressed", risk_flags:[{type:"fall",severity:"high",detail:"Unwitnessed fall near bathroom"}], cqc_domains:["Safe","Responsive"], follow_up_required:true  },
  { id:3, residentId:3, ts:new Date(Date.now()-1*3600000).toISOString(), resident_name:"Agnes Webb",  observation:"Distressed, calling for daughter. Settled after music.", action_taken:"20 minutes companionship. 1950s playlist played.", mood:"Calm",        risk_flags:[], cqc_domains:["Caring","Responsive"], follow_up_required:false },
  { id:4, residentId:4, ts:new Date(Date.now()-3*3600000).toISOString(), resident_name:"Robert Shaw", observation:"Engaged well at lunch and afternoon activities.", action_taken:"Participation encouraged. No concerns.", mood:"Happy",      risk_flags:[], cqc_domains:["Caring","Effective","Well-Led"], follow_up_required:false },
  { id:5, residentId:5, ts:new Date(Date.now()-6*3600000).toISOString(), resident_name:"Edith Crane", observation:"Stage 1 redness on left heel during pressure check.", action_taken:"Heel protector applied. Senior staff informed.", mood:"Calm", risk_flags:[{type:"pressure_sore",severity:"moderate",detail:"Stage 1 redness left heel"}], cqc_domains:["Safe","Effective"], follow_up_required:true },
];

const RESIDENT_HISTORY = {
  1:[{date:"14 Mar",mood:"Agitated",fluid:60,food:40,risk:"high",note:"Refused meds. Confused. Low intake."},{date:"13 Mar",mood:"Calm",fluid:80,food:70,risk:"none",note:"Ate well. Settled at bedtime."},{date:"12 Mar",mood:"Confused",fluid:50,food:30,risk:"moderate",note:"Didn't recognise key worker. Very low fluid."},{date:"11 Mar",mood:"Happy",fluid:90,food:85,risk:"none",note:"Daughter visited. Excellent mood."},{date:"10 Mar",mood:"Agitated",fluid:55,food:45,risk:"high",note:"3rd consecutive Monday meds refusal."},{date:"08 Mar",mood:"Happy",fluid:95,food:90,risk:"none",note:"Daughter visited — Mary in great spirits."},{date:"07 Mar",mood:"Agitated",fluid:50,food:40,risk:"high",note:"Monday meds refusal again. Flagged."}],
  2:[{date:"14 Mar",mood:"Distressed",fluid:70,food:50,risk:"high",note:"2nd fall this week. Very shaken."},{date:"13 Mar",mood:"Withdrawn",fluid:65,food:55,risk:"low",note:"Quiet. Didn't join group activity."},{date:"12 Mar",mood:"Distressed",fluid:60,food:45,risk:"high",note:"Fall in bedroom. Mobility worsening."},{date:"11 Mar",mood:"Calm",fluid:80,food:75,risk:"none",note:"Son visited. Excellent mood."},{date:"07 Mar",mood:"Happy",fluid:90,food:88,risk:"none",note:"Son visited Friday — animated."}],
  3:[{date:"14 Mar",mood:"Distressed",fluid:55,food:35,risk:"moderate",note:"Calling for daughter. 12 days since visit."},{date:"13 Mar",mood:"Calm",fluid:70,food:60,risk:"none",note:"Music therapy effective."},{date:"11 Mar",mood:"Distressed",fluid:45,food:30,risk:"high",note:"Very distressed. Fluid dangerously low."},{date:"08 Mar",mood:"Happy",fluid:85,food:75,risk:"none",note:"Helen visited yesterday. Eating well."}],
  4:[{date:"14 Mar",mood:"Happy",fluid:85,food:80,risk:"none",note:"Good day. Engaged in activities."},{date:"13 Mar",mood:"Calm",fluid:80,food:75,risk:"none",note:"Routine day. No concerns."},{date:"12 Mar",mood:"Calm",fluid:78,food:72,risk:"none",note:"Wife called. Cheered him up."}],
  5:[{date:"14 Mar",mood:"Calm",fluid:65,food:55,risk:"moderate",note:"Pressure area redness left heel. Treated."},{date:"13 Mar",mood:"Calm",fluid:70,food:65,risk:"none",note:"Routine care. Crossword completed."},{date:"12 Mar",mood:"Withdrawn",fluid:60,food:50,risk:"low",note:"Quieter than usual."}],
};

const RESIDENT_TASKS = {
  1: [
    { id:"1a", icon:"💊", label:"Morning Medication",       detail:"Amlodipine, Aspirin, Metformin — check for refusal and document", priority:"high",   shift:"morning"   },
    { id:"1b", icon:"🛁", label:"Personal Care",             detail:"Full wash and dress. Let Mary choose her own clothing. Check skin.", priority:"high",   shift:"morning"   },
    { id:"1c", icon:"🍽", label:"Breakfast Monitoring",      detail:"Monitor intake — target 70%+. Encourage fluids. Note any refusal.", priority:"high",   shift:"morning"   },
    { id:"1d", icon:"💧", label:"Fluid Intake Check",        detail:"Mary has been dehydrated — encourage tea throughout shift. Target 6 cups.", priority:"high",   shift:"morning"   },
    { id:"1e", icon:"🔄", label:"Repositioning",             detail:"Reposition every 2 hours. Check heel skin — previous redness noted.", priority:"moderate",shift:"morning"   },
    { id:"1f", icon:"💊", label:"Evening Medication",        detail:"Check MAR chart. Document any refusals. Inform nurse if refused.", priority:"high",   shift:"afternoon" },
    { id:"1g", icon:"🌙", label:"Night Check",                detail:"Check at 22:00, 02:00, 05:00. Note sleep quality and any disturbance.", priority:"moderate",shift:"night"     },
  ],
  2: [
    { id:"2a", icon:"💊", label:"Morning Medication",       detail:"Levodopa must be given on time — Parkinson's symptom control critical.", priority:"high",   shift:"morning"   },
    { id:"2b", icon:"🚿", label:"Shower Assistance",         detail:"John prefers shower not bath. Full assistance needed. Slip risk — use mat.", priority:"high",   shift:"morning"   },
    { id:"2c", icon:"🍽", label:"Breakfast & Lunch",         detail:"Monitor intake carefully — nutrition declining this week.", priority:"high",   shift:"morning"   },
    { id:"2d", icon:"🔄", label:"Falls Risk Check",          detail:"Two falls this week. Assess mobility before walking. Stay close.", priority:"high",   shift:"morning"   },
    { id:"2e", icon:"💊", label:"Evening Medication",        detail:"Levodopa evening dose — timing important. Document given time.", priority:"high",   shift:"afternoon" },
    { id:"2f", icon:"🌙", label:"Night Check",                detail:"Monitor overnight — Parkinson's can cause night restlessness.", priority:"moderate",shift:"night"     },
  ],
  3: [
    { id:"3a", icon:"🍽", label:"Breakfast Monitoring",      detail:"Agnes fluid intake very low — offer small amounts frequently. Target 1L.", priority:"high",   shift:"morning"   },
    { id:"3b", icon:"🛁", label:"Personal Care",             detail:"Agnes may resist — approach gently. Play 1950s music to settle her.", priority:"high",   shift:"morning"   },
    { id:"3c", icon:"💊", label:"Medication",                 detail:"Warfarin — check dose on MAR. Any bruising to report immediately.", priority:"high",   shift:"morning"   },
    { id:"3d", icon:"🤲", label:"Comfort & Companionship",   detail:"Agnes has been distressed — spend time with her. Music therapy helps.", priority:"moderate",shift:"morning"   },
    { id:"3e", icon:"🔄", label:"Repositioning",             detail:"Arthritis — reposition every 2 hours. Gentle handling, note any pain.", priority:"moderate",shift:"morning"   },
    { id:"3f", icon:"🌙", label:"Night Check",                detail:"Agnes often wakes distressed at night — have 1950s playlist ready.", priority:"high",   shift:"night"     },
  ],
  4: [
    { id:"4a", icon:"💊", label:"Morning Medication",       detail:"Inhaler before activity. Check technique — COPD management.", priority:"high",   shift:"morning"   },
    { id:"4b", icon:"🍽", label:"Meal Monitoring",           detail:"Monitor dietary intake — diabetic diet. No sugary snacks.", priority:"high",   shift:"morning"   },
    { id:"4c", icon:"⚖",  label:"Blood Sugar Check",        detail:"Check blood glucose before breakfast and dinner. Record in chart.", priority:"high",   shift:"morning"   },
    { id:"4d", icon:"🏃", label:"Activity Encouragement",    detail:"Robert responds well to activities — encourage participation.", priority:"low",    shift:"afternoon" },
    { id:"4e", icon:"💊", label:"Evening Medication",        detail:"Inhaler and diabetes medication. Check blood sugar after dinner.", priority:"high",   shift:"afternoon" },
  ],
  5: [
    { id:"5a", icon:"🔄", label:"Pressure Area Check",       detail:"URGENT — Stage 1 redness on left heel. Check and document every shift.", priority:"high",   shift:"morning"   },
    { id:"5b", icon:"🛁", label:"Personal Care",             detail:"Full assistance needed. Skin check entire body — heart failure causes swelling.", priority:"high",   shift:"morning"   },
    { id:"5c", icon:"💊", label:"Morning Medication",       detail:"Heart medication — critical timing. Check for ankle swelling before giving.", priority:"high",   shift:"morning"   },
    { id:"5d", icon:"💧", label:"Fluid Monitoring",          detail:"Heart failure — strict fluid balance. Record all intake and output.", priority:"high",   shift:"morning"   },
    { id:"5e", icon:"💊", label:"Evening Medication",        detail:"Evening heart medication. Check breathing — report any shortness of breath.", priority:"high",   shift:"afternoon" },
    { id:"5f", icon:"🌙", label:"Night Check",                detail:"Check breathing and ankle swelling overnight. Heart failure can worsen at night.", priority:"high",   shift:"night"     },
  ],
};

const PRIORITY_C = { high:C.high, moderate:C.mod, low:C.eff };

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const ago  = iso => { const m=(Date.now()-new Date(iso))/60000; if(m<60)return`${~~m}m ago`; if(m<1440)return`${~~(m/60)}h ago`; return`${~~(m/1440)}d ago`; };
const fmt  = iso => { try{return new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});}catch{return iso;} };
const fmtD = d   => { try{return new Date(d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});}catch{return d;} };
const dScore = (notes,d) => { const r=notes.filter(n=>n.cqc_domains?.includes(d)); if(!r.length)return 82; const p=r.reduce((s,n)=>s+(n.risk_flags?.reduce((a,f)=>a+(f.severity==="high"?14:f.severity==="moderate"?7:2),0)||0),0); return Math.max(40,Math.min(100,100-~~(p/r.length))); };
const oScore = notes => { const s=Object.keys(DOMAIN).map(d=>dScore(notes,d)); return ~~(s.reduce((a,b)=>a+b,0)/s.length); };
const rLabel = s => s>=90?"Outstanding":s>=75?"Good":s>=60?"Requires Improvement":"Inadequate";

// ── Gemini AI Layer ───────────────────────────────────────────────────────────
let GEMINI_KEY = "";
const setGeminiKey = (k) => { GEMINI_KEY = k; };

const aiCall = async (system, msg, tok=1000) => {
  if (!GEMINI_KEY) throw new Error("NO_API_KEY");
  
  const prompt = `${system}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation. Just the raw JSON object.\n\n${msg}`;
  
  // FIXED CONNECTION: Using stable model and direct key param
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1500, temperature: 0.1 },
    safetySettings: [
      { category:"HARM_CATEGORY_HARASSMENT",        threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_HATE_SPEECH",       threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_DANGEROUS_CONTENT", threshold:"BLOCK_NONE" },
    ]
  };

  const r = await fetch(url, { 
    method:"POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(body) 
  });

  if (!r.ok) {
    const err = await r.json().catch(()=>({}));
    throw new Error(err?.error?.message || `HTTP ${r.status}`);
  }

  const d = await r.json();
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Clean up any markdown code blocks the AI might accidentally include
  return text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────────────────────
const Box = ({children,style={}}) => <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,...style}}>{children}</div>;
const Btn = ({children,onClick,loading,style={}}) => <button onClick={onClick} disabled={loading} style={{padding:"10px 20px",background:loading?C.card:C.gold,color:loading?C.soft:"#0D1825",border:"none",borderRadius:6,cursor:loading?"wait":"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1,fontFamily:"inherit",opacity:loading?0.7:1,...style}}>{children}</button>;
const Dots = () => <div style={{display:"flex",justifyContent:"center",gap:8,padding:"8px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:C.gold,animation:`pulse 1s ${i*.2}s ease-in-out infinite`}}/>)}</div>;
const Blink = () => <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:C.high,animation:"blink 1s ease-in-out infinite"}}/>;
const DTag = ({d,small}) => { const c=DOMAIN[d]?.color||C.soft; return <span style={{fontSize:small?8:9,padding:small?"1px 5px":"2px 7px",borderRadius:8,background:c+"18",color:c,fontWeight:"bold"}}>{d}</span>; };
const Panel = ({title,items,color,icon}) => <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:14}}><div style={{fontSize:8,letterSpacing:2,color,textTransform:"uppercase",marginBottom:10}}>{title}</div>{items?.map((t,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7}}><span style={{color,fontSize:11,flexShrink:0}}>{icon}</span><span style={{fontSize:11,color:C.soft,lineHeight:1.5}}>{t}</span></div>)}</div>;
const Chip = ({label,val,color}) => <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 14px",textAlign:"center"}}><div style={{fontSize:8,color:C.soft,letterSpacing:2,marginBottom:3,textTransform:"uppercase"}}>{label}</div><div style={{fontSize:12,fontWeight:"bold",color}}>{val}</div></div>;

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN & SETUP COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function GeminiSetup({ keyInput, setKeyInput, onSubmit, error, testing }) {
  return (
    <div style={{minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"inherit"}}>
      <Box style={{maxWidth:400, width:"100%", padding:40, textAlign:"center"}}>
        <div style={{fontSize:10, letterSpacing:5, color:C.gold, textTransform:"uppercase", marginBottom:10}}>System Initialization</div>
        <h1 style={{fontSize:24, fontWeight:"bold", marginBottom:20, color:C.text}}>Connect AI Engine</h1>
        <p style={{fontSize:13, color:C.soft, marginBottom:30, lineHeight:1.6}}>Paste your Gemini API key from Google AI Studio to launch the CareIQ dashboard.</p>
        <input 
          type="password" 
          value={keyInput} 
          onChange={e => setKeyInput(e.target.value)}
          placeholder="AIza..." 
          style={{width:"100%", padding:15, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, marginBottom:10, outline:"none"}}
        />
        {error && <p style={{color:C.high, fontSize:11, marginBottom:15}}>{error}</p>}
        <Btn onClick={onSubmit} loading={testing} style={{width:"100%", padding:15}}>Connect and Launch CareIQ</Btn>
      </Box>
    </div>
  );
}

function Login({ staff, onLogin }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const s = staff.find(x => x.pin === pin);
    if (s) onLogin(s);
    else setErr("Invalid PIN Access Denied");
  };

  return (
    <div style={{minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <Box style={{maxWidth:360, width:"100%", padding:40, textAlign:"center"}}>
        <div style={{fontSize:10, letterSpacing:5, color:C.gold, textTransform:"uppercase", marginBottom:10}}>Secure Access</div>
        <h1 style={{fontSize:22, fontWeight:"bold", marginBottom:30, color:C.text}}>Staff Identity</h1>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:25}}>
          {[1,2,3,4,5,6,7,8,9,"C",0,"OK"].map(k => (
            <button 
              key={k}
              onClick={() => {
                if (k === "C") setPin("");
                else if (k === "OK") handleLogin();
                else if (pin.length < 4) setPin(p => p + k);
              }}
              style={{height:60, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:18, cursor:"pointer", fontWeight: k === "OK" ? "bold" : "normal"}}
            >
              {k}
            </button>
          ))}
        </div>
        <div style={{letterSpacing:10, fontSize:24, color:C.gold, height:30}}>{pin.replace(/./g, "•")}</div>
        {err && <p style={{color:C.high, fontSize:11, marginTop:10}}>{err}</p>}
      </Box>
    </div>
  );
}

function Locked({ role }) {
  return (
    <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", opacity:0.5}}>
      <div style={{fontSize:40, marginBottom:15}}>🔒</div>
      <div style={{fontSize:14, fontWeight:"bold"}}>Access Restricted</div>
      <div style={{fontSize:11, color:C.soft, marginTop:5}}>Your role as {role.toUpperCase()} does not have clearance for this terminal.</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ notes, user }) {
  const score = oScore(notes);
  return (
    <div style={{padding:26, maxWidth:1100, margin:"0 auto", animation:"fadeIn 0.4s ease"}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20, marginBottom:30}}>
        <Chip label="Overall Rating" val={rLabel(score)} color={RATING_C[rLabel(score)]}/>
        <Chip label="Compliance Score" val={`${score}%`} color={C.gold}/>
        <Chip label="Active Risks" val={notes.filter(n=>n.risk_flags?.length).length} color={C.high}/>
        <Chip label="Follow-ups" val={notes.filter(n=>n.follow_up_required).length} color={C.mod}/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:25}}>
        <Box style={{padding:20}}>
          <div style={{fontSize:10, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:20}}>Domain Health</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:15}}>
            {Object.keys(DOMAIN).map(d => {
              const s = dScore(notes, d);
              return (
                <div key={d} style={{background:C.bg, padding:15, borderRadius:8, border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10, color:C.soft, marginBottom:8}}>{d}</div>
                  <div style={{fontSize:20, fontWeight:"bold", color:DOMAIN[d].color}}>{s}%</div>
                  <div style={{height:3, background:C.border, marginTop:10, borderRadius:2}}>
                    <div style={{width:`${s}%`, height:"100%", background:DOMAIN[d].color, borderRadius:2}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Box>
        <Box style={{padding:20}}>
          <div style={{fontSize:10, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:20}}>Urgent Flags</div>
          {notes.filter(n=>n.risk_flags?.length).slice(0,4).map(n => (
            <div key={n.id} style={{marginBottom:15, paddingBottom:15, borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:5}}>
                <span style={{fontSize:11, fontWeight:"bold"}}>{n.resident_name}</span>
                <span style={{fontSize:9, color:C.high}}><Blink/> CRITICAL</span>
              </div>
              <div style={{fontSize:10, color:C.soft}}>{n.risk_flags[0].detail}</div>
            </div>
          ))}
        </Box>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function Notes({ onSave, user }) {
  const [raw, setRaw] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  
  // Ref for universal speech recognition
  const recogRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recogRef.current = new SpeechRecognition();
      recogRef.current.continuous = false;
      recogRef.current.lang = 'en-GB';
      recogRef.current.onresult = (e) => {
        setRaw(prev => prev + " " + e.results[0][0].transcript);
        setRecording(false);
      };
      recogRef.current.onend = () => setRecording(false);
    }
  }, []);

  const toggleMic = () => {
    if (!recogRef.current) return alert("Mic not supported in this browser");
    if (recording) {
      recogRef.current.stop();
      setRecording(false);
    } else {
      setRecording(true);
      recogRef.current.start();
    }
  };

  const process = async () => {
    setLoading(true);
    try {
      const sys = `You are a clinical care note auditor. Convert rough notes into a structured JSON care log.
      REQUIRED FIELDS: resident_name, observation, action_taken, mood (Happy/Calm/Agitated/Distressed/Confused/Withdrawn), risk_flags (array of {type,severity,detail}), cqc_domains (array of Safe, Effective, Caring, Responsive, Well-Led), follow_up_required (boolean).`;
      
      const json = await aiCall(sys, raw);
      const parsed = JSON.parse(json);
      setRes({ ...parsed, ts: new Date().toISOString() });
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:26, maxWidth:800, margin:"0 auto", animation:"fadeIn 0.4s ease"}}>
      <Box style={{padding:30, marginBottom:25}}>
        <textarea 
          value={raw}
          onChange={e=>setRaw(e.target.value)}
          placeholder="Enter rough observations here (e.g., 'Mary refused meds, stomach upset, nurse told')..."
          style={{width:"100%", height:150, background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:20, color:C.text, fontSize:14, outline:"none", marginBottom:20, resize:"none"}}
        />
        <div style={{display:"flex", gap:15}}>
          <button 
            onClick={toggleMic}
            style={{flex:1, height:50, borderRadius:8, border:`1.5px solid ${recording ? C.high : C.border}`, background: recording ? C.high + "20" : "transparent", color: recording ? C.high : C.soft, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10}}
          >
            {recording ? <Blink/> : "🎤"} {recording ? "Listening..." : "Tap to Speak"}
          </button>
          <Btn onClick={process} loading={loading} style={{flex:2, height:50}}>Generate Clinical Note</Btn>
        </div>
      </Box>

      {res && (
        <Box style={{padding:30, borderTop:`4px solid ${C.gold}`, animation:"fadeIn 0.3s ease"}}>
           <div style={{display:"flex", justifyContent:"space-between", marginBottom:20}}>
             <div style={{fontSize:18, fontWeight:"bold"}}>{res.resident_name}</div>
             <div style={{display:"flex", gap:5}}>{res.cqc_domains.map(d=><DTag key={d} d={d}/>)}</div>
           </div>
           <Panel title="Observation" color={C.gold} icon="●" items={[res.observation]}/>
           <div style={{marginTop:20}}>
             <Panel title="Action Taken" color={C.eff} icon="✓" items={[res.action_taken]}/>
           </div>
           <div style={{marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:15}}>
             <Chip label="Mood" val={res.mood} color={MOOD_C[res.mood]}/>
             <Chip label="Follow-up" val={res.follow_up_required?"Yes":"No"} color={res.follow_up_required?C.high:C.eff}/>
           </div>
           <Btn onClick={() => {onSave(res); setRes(null); setRaw("");}} style={{width:"100%", marginTop:30, background:C.eff}}>Save to Care Records</Btn>
        </Box>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESIDENTS TERMINAL
// ─────────────────────────────────────────────────────────────────────────────
function Residents() {
  const [sel, setSel] = useState(SEED_RESIDENTS[0]);
  return (
    <div style={{padding:26, display:"grid", gridTemplateColumns:"300px 1fr", gap:26, height:"100%", overflow:"hidden"}}>
      <div style={{overflow:"auto", paddingRight:10}}>
        {SEED_RESIDENTS.map(r => (
          <div key={r.id} onClick={()=>setSel(r)} style={{padding:15, background:sel.id===r.id?C.goldDim:C.surface, border:`1px solid ${sel.id===r.id?C.gold:C.border}`, borderRadius:8, marginBottom:10, cursor:"pointer"}}>
            <div style={{fontSize:13, fontWeight:"bold", color:sel.id===r.id?C.gold:C.text}}>{r.name}</div>
            <div style={{fontSize:10, color:C.soft, marginTop:4}}>Room {r.room} · Age {r.age}</div>
          </div>
        ))}
      </div>
      <div style={{overflow:"auto"}}>
        <Box style={{padding:30, marginBottom:25}}>
          <h2 style={{fontSize:22, fontWeight:"bold", marginBottom:5}}>{sel.name}</h2>
          <div style={{fontSize:11, color:C.soft, marginBottom:20}}>Room {sel.room} | Primary Conditions: {sel.conditions.join(", ")}</div>
          
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20, marginBottom:30}}>
            <Panel title="Family & Contact" color={C.resp} icon="◈" items={[sel.family]}/>
            <Panel title="Preferences" color={C.care} icon="♥" items={[sel.preferences]}/>
          </div>

          <div style={{fontSize:10, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:15}}>Care History (Last 7 Days)</div>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {RESIDENT_HISTORY[sel.id].map((h,i) => (
              <div key={i} style={{background:C.bg, padding:15, borderRadius:8, border:`1px solid ${C.border}`, display:"grid", gridTemplateColumns:"100px 100px 1fr", gap:15, alignItems:"center"}}>
                <div style={{fontSize:12, fontWeight:"bold"}}>{h.date}</div>
                <div style={{fontSize:10, color:MOOD_C[h.mood]}}>{h.mood}</div>
                <div style={{fontSize:11, color:C.soft}}>{h.note}</div>
              </div>
            ))}
          </div>
        </Box>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE TERMINAL
// ─────────────────────────────────────────────────────────────────────────────
function Evidence({ notes }) {
  const [filter, setFilter] = useState("Safe");
  return (
    <div style={{padding:26, maxWidth:1000, margin:"0 auto"}}>
      <div style={{display:"flex", gap:10, marginBottom:30, flexWrap:"wrap"}}>
        {Object.keys(DOMAIN).map(d => (
          <button key={d} onClick={()=>setFilter(d)} style={{padding:"8px 16px", background:filter===d?DOMAIN[d].color+"20":"transparent", border:`1.5px solid ${filter===d?DOMAIN[d].color:C.border}`, borderRadius:20, color:filter===d?DOMAIN[d].color:C.soft, fontSize:11, fontWeight:"bold", cursor:"pointer"}}>
            {d} Evidence
          </button>
        ))}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:15}}>
        {notes.filter(n=>n.cqc_domains.includes(filter)).map(n => (
          <Box key={n.id} style={{padding:20, borderLeft:`4px solid ${DOMAIN[filter].color}`}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
              <span style={{fontSize:13, fontWeight:"bold"}}>{n.resident_name}</span>
              <span style={{fontSize:10, color:C.soft}}>{fmt(n.ts)}</span>
            </div>
            <div style={{fontSize:12, color:C.text, lineHeight:1.5, marginBottom:10}}>{n.observation}</div>
            <div style={{fontSize:11, padding:10, background:C.bg, borderRadius:6, color:C.eff}}>Action: {n.action_taken}</div>
          </Box>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function Staff({ staff, me, shifts }) {
  return (
    <div style={{padding:26, maxWidth:1000, margin:"0 auto"}}>
      <div style={{fontSize:10, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:20}}>Current On-Duty Personnel</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20, marginBottom:40}}>
        {staff.map(s => (
          <Box key={s.id} style={{padding:20, display:"flex", gap:15, alignItems:"center"}}>
            <div style={{width:45, height:45, borderRadius:"50%", background:ROLES[s.role].color+"20", border:`2px solid ${ROLES[s.role].color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:"bold", color:ROLES[s.role].color}}>{s.initials}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:"bold"}}>{s.name}</div>
              <div style={{fontSize:10, color:C.soft}}>{ROLES[s.role].label}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9, color:C.eff}}>ONLINE</div>
              <div style={{fontSize:10, color:C.soft}}>{s.lastLogin}</div>
            </div>
          </Box>
        ))}
      </div>

      <div style={{fontSize:10, letterSpacing:2, color:C.gold, textTransform:"uppercase", marginBottom:20}}>Shift Rotations</div>
      {shifts.map(s => (
        <Box key={s.id} style={{padding:20, marginBottom:15, opacity:s.status==="upcoming"?0.6:1}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
             <div>
               <div style={{fontSize:14, fontWeight:"bold"}}>{s.label}</div>
               <div style={{fontSize:11, color:C.soft}}>{s.time}</div>
             </div>
             <div style={{fontSize:10, padding:"4px 10px", borderRadius:10, background:s.status==="active"?C.eff+"20":C.surface, color:s.status==="active"?C.eff:C.soft}}>
               {s.status.toUpperCase()}
             </div>
          </div>
        </Box>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK REMINDER POPUP (Modified to work within ROOT)
// ─────────────────────────────────────────────────────────────────────────────
function TaskReminder({ user, tasks, doneTasks, onMarkDone, onMarkUndone, onClose, pendingCount, completedCount }) {
  const [filter, setFilter] = useState("pending");
  
  const displayed = tasks
    .filter(t => filter === "all" || !doneTasks[t.id])
    .sort((a,b) => {
      const order = { high:0, moderate:1, low:2 };
      return order[a.priority] - order[b.priority];
    });

  const allDone = pendingCount === 0;

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <Box style={{maxWidth:500, width:"100%", maxHeight:"80vh", overflow:"hidden", display:"flex", flexDirection:"column", padding:30}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:20}}>
          <div>
            <div style={{fontSize:10, letterSpacing:3, color:allDone?C.eff:C.high, textTransform:"uppercase"}}>{allDone?"✓ Duty Complete":"⚠ Tasks Pending"}</div>
            <div style={{fontSize:20, fontWeight:"bold"}}>Shift Check-in</div>
          </div>
          <button onClick={onClose} style={{background:"none", border:"none", color:C.soft, fontSize:20, cursor:"pointer"}}>×</button>
        </div>
        
        <div style={{display:"flex", gap:10, marginBottom:20}}>
           <button onClick={()=>setFilter("pending")} style={{flex:1, padding:8, borderRadius:6, background:filter==="pending"?C.goldDim:"transparent", border:`1px solid ${filter==="pending"?C.gold:C.border}`, color:filter==="pending"?C.gold:C.soft, fontSize:11, cursor:"pointer"}}>Pending</button>
           <button onClick={()=>setFilter("all")} style={{flex:1, padding:8, borderRadius:6, background:filter==="all"?C.goldDim:"transparent", border:`1px solid ${filter==="all"?C.gold:C.border}`, color:filter==="all"?C.gold:C.soft, fontSize:11, cursor:"pointer"}}>All Tasks</button>
        </div>

        <div style={{flex:1, overflow:"auto", display:"flex", flexDirection:"column", gap:10}}>
          {displayed.map(t => (
            <div key={t.id} style={{padding:15, background:C.bg, borderRadius:8, border:`1px solid ${C.border}`, display:"flex", gap:15, alignItems:"flex-start"}}>
              <input 
                type="checkbox" 
                checked={!!doneTasks[t.id]} 
                onChange={() => doneTasks[t.id] ? onMarkUndone(t.id) : onMarkDone(t.id)}
                style={{marginTop:4}}
              />
              <div>
                <div style={{fontSize:13, fontWeight:"bold", color:PRIORITY_C[t.priority]}}>{t.label}</div>
                <div style={{fontSize:10, color:C.soft, marginTop:2}}>{t.residentName} · {t.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <Btn onClick={onClose} style={{marginTop:20, width:"100%"}}>Resume Care</Btn>
      </Box>
    </div>
  );
}

// ── ROOT EXPORT ──────────────────────────────────────────────────────────────
function CareIQ() {
  const [user,setUser]             = useState(null);
  const [staff,setStaff]           = useState(SEED_STAFF);
  const [notes,setNotes]           = useState(SEED_NOTES);
  const [shifts,setShifts]         = useState(SEED_SHIFTS);
  const [mod,setMod]               = useState("dashboard");
  const [showReminder,setShowReminder] = useState(false);
  const [doneTasks,setDoneTasks] = useState({});
  const [apiKey,setApiKeyState]   = useState("");
  const [keyInput,setKeyInput]    = useState("");
  const [keyError,setKeyError]    = useState("");
  const [keyTesting,setKeyTesting] = useState(false);
  const reminderTimer             = useRef(null);

  const submitKey = () => {
    if (!keyInput.trim()) return;
    setGeminiKey(keyInput.trim());
    setApiKeyState(keyInput.trim());
  };

  const login = u => {
    setUser(u);
    setMod(ROLES[u.role].access[0]);
    if (u.role === "carer" || u.role === "senior") setShowReminder(true);
  };

  const logout = () => {
    setUser(null);
    setDoneTasks({});
    setShowReminder(false);
  };

  const addNote = n => setNotes(p => [{...n, id:Date.now()}, ...p]);
  const can     = m => user && ROLES[user.role].access.includes(m);

  const markDone = (id) => setDoneTasks(p => ({...p, [id]: true}));
  const markUndone = (id) => setDoneTasks(p => {const n={...p}; delete n[id]; return n;});

  const myResidentIds = user ? (user.role === "carer" ? (user.keyWorkers || []) : SEED_RESIDENTS.map(r => r.id)) : [];
  const myTasks = myResidentIds.flatMap(rId => {
    const res = SEED_RESIDENTS.find(r => r.id === rId);
    return (RESIDENT_TASKS[rId] || []).map(t => ({...t, residentId:rId, residentName:res?.name}));
  });

  if (!apiKey) return <GeminiSetup keyInput={keyInput} setKeyInput={setKeyInput} onSubmit={submitKey} error={keyError} testing={keyTesting}/>;
  if (!user) return <Login staff={staff} onLogin={login}/>;

  return (
    <div style={{display:"flex", minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"sans-serif"}}>
      {showReminder && (user.role === "carer" || user.role === "senior") && (
        <TaskReminder 
          user={user} 
          tasks={myTasks} 
          doneTasks={doneTasks} 
          onMarkDone={markDone} 
          onMarkUndone={markUndone} 
          onClose={() => setShowReminder(false)} 
          pendingCount={myTasks.filter(t => !doneTasks[t.id]).length} 
          completedCount={Object.keys(doneTasks).length}
        />
      )}

      {/* Sidebar */}
      <div style={{width:200, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column"}}>
        <div style={{padding:25, borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:8, letterSpacing:4, color:C.gold, textTransform:"uppercase", marginBottom:5}}>CareIQ</div>
          <div style={{fontSize:14, fontWeight:"bold"}}>Digital Logs</div>
        </div>
        <nav style={{flex:1, padding:10}}>
          {NAV.map(n => {
            const ok = can(n.id);
            return (
              <button 
                key={n.id} 
                onClick={() => ok && setMod(n.id)}
                style={{width:"100%", padding:12, marginBottom:5, background:mod===n.id?C.goldDim:"transparent", border:"none", borderRadius:8, color:ok? (mod===n.id?C.gold:C.soft) : C.muted, cursor:ok?"pointer":"not-allowed", textAlign:"left", fontSize:12, fontWeight:mod===n.id?"bold":"normal"}}
              >
                {n.icon} {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{padding:20, borderTop:`1px solid ${C.border}`}}>
           <div style={{fontSize:11, fontWeight:"bold"}}>{user.name}</div>
           <button onClick={logout} style={{fontSize:10, color:C.high, background:"none", border:"none", padding:0, cursor:"pointer", marginTop:5}}>Sign Out</button>
        </div>
      </div>

      <div style={{flex:1, overflow:"auto", display:"flex", flexDirection:"column"}}>
        <header style={{padding:20, background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
           <div style={{fontSize:14, fontWeight:"bold", color:C.gold}}>{mod.toUpperCase()}</div>
           <div style={{fontSize:11, color:C.soft}}>{new Date().toDateString()}</div>
        </header>
        <div style={{flex:1}}>
          {mod === "dashboard" && <Dashboard notes={notes} user={user} />}
          {mod === "notes" && <Notes onSave={addNote} user={user} />}
          {mod === "residents" && <Residents />}
          {mod === "evidence" && <Evidence notes={notes} />}
          {mod === "staff" && <Staff staff={staff} me={user} shifts={shifts} />}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export { CareIQ };
