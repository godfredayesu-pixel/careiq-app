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
  carer:      { label:"Care Staff",         color:"#10B981", badge:"CARER",      access:["notes"]                                              },
  senior:     { label:"Senior Carer",       color:"#3B82F6", badge:"SENIOR",     access:["notes","dashboard"]                                  },
  manager:    { label:"Registered Manager", color:"#D4A853", badge:"MANAGER",    access:["notes","dashboard","evidence","residents","staff"]    },
  compliance: { label:"Compliance Officer", color:"#8B5CF6", badge:"COMPLIANCE", access:["notes","dashboard","evidence","residents","staff"]    },
};

const NAV = [
  { id:"dashboard", icon:"◈", label:"Dashboard"  },
  { id:"notes",     icon:"◎", label:"Notes"       },
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
  { id:3, date:TD, shift:"night",     label:"Night Shift",     time:"21:00–07:30", status:"upcoming", assignments:[{staffId:1,residentIds:[1,2,3,4,5]}] },
];

const SEED_NOTES = [
  { id:1, residentId:1, ts:new Date(Date.now()-2*3600000).toISOString(), resident_name:"Mary Jones",  observation:"Refused morning medication — stomach upset.", action_taken:"Nurse informed. Monitoring increased.", mood:"Agitated",   risk_flags:[{type:"medication_refusal",severity:"high",detail:"Refused prescribed medication"}], cqc_domains:["Safe","Effective"], follow_up_required:true  },
  { id:2, residentId:2, ts:new Date(Date.now()-5*3600000).toISOString(), resident_name:"John Patel",  observation:"Found on floor near bathroom, no injuries.",  action_taken:"Assisted to chair. Nurse called. Incident form completed.", mood:"Distressed", risk_flags:[{type:"fall",severity:"high",detail:"Unwitnessed fall near bathroom"}], cqc_domains:["Safe","Responsive"], follow_up_required:true  },
  { id:3, residentId:3, ts:new Date(Date.now()-1*3600000).toISOString(), resident_name:"Agnes Webb",  observation:"Distressed, calling for daughter. Settled after music.", action_taken:"20 minutes companionship. 1950s playlist played.", mood:"Calm",       risk_flags:[], cqc_domains:["Caring","Responsive"], follow_up_required:false },
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

// ─────────────────────────────────────────────────────────────────────────────
// RESIDENT DAILY TASKS — what carers must do each shift
// ─────────────────────────────────────────────────────────────────────────────
const RESIDENT_TASKS = {
  1: [
    { id:"1a", icon:"💊", label:"Morning Medication",        detail:"Amlodipine, Aspirin, Metformin — check for refusal and document", priority:"high",   shift:"morning"   },
    { id:"1b", icon:"🛁", label:"Personal Care",             detail:"Full wash and dress. Let Mary choose her own clothing. Check skin.", priority:"high",   shift:"morning"   },
    { id:"1c", icon:"🍽", label:"Breakfast Monitoring",      detail:"Monitor intake — target 70%+. Encourage fluids. Note any refusal.", priority:"high",   shift:"morning"   },
    { id:"1d", icon:"💧", label:"Fluid Intake Check",        detail:"Mary has been dehydrated — encourage tea throughout shift. Target 6 cups.", priority:"high",   shift:"morning"   },
    { id:"1e", icon:"🔄", label:"Repositioning",             detail:"Reposition every 2 hours. Check heel skin — previous redness noted.", priority:"moderate",shift:"morning"   },
    { id:"1f", icon:"💊", label:"Evening Medication",        detail:"Check MAR chart. Document any refusals. Inform nurse if refused.", priority:"high",   shift:"afternoon" },
    { id:"1g", icon:"🌙", label:"Night Check",               detail:"Check at 22:00, 02:00, 05:00. Note sleep quality and any disturbance.", priority:"moderate",shift:"night"     },
  ],
  2: [
    { id:"2a", icon:"💊", label:"Morning Medication",        detail:"Levodopa must be given on time — Parkinson's symptom control critical.", priority:"high",   shift:"morning"   },
    { id:"2b", icon:"🚿", label:"Shower Assistance",         detail:"John prefers shower not bath. Full assistance needed. Slip risk — use mat.", priority:"high",   shift:"morning"   },
    { id:"2c", icon:"🍽", label:"Breakfast & Lunch",         detail:"Monitor intake carefully — nutrition declining this week.", priority:"high",   shift:"morning"   },
    { id:"2d", icon:"🔄", label:"Falls Risk Check",          detail:"Two falls this week. Assess mobility before walking. Stay close.", priority:"high",   shift:"morning"   },
    { id:"2e", icon:"💊", label:"Evening Medication",        detail:"Levodopa evening dose — timing important. Document given time.", priority:"high",   shift:"afternoon" },
    { id:"2f", icon:"🌙", label:"Night Check",               detail:"Monitor overnight — Parkinson's can cause night restlessness.", priority:"moderate",shift:"night"     },
  ],
  3: [
    { id:"3a", icon:"🍽", label:"Breakfast Monitoring",      detail:"Agnes fluid intake very low — offer small amounts frequently. Target 1L.", priority:"high",   shift:"morning"   },
    { id:"3b", icon:"🛁", label:"Personal Care",             detail:"Agnes may resist — approach gently. Play 1950s music to settle her.", priority:"high",   shift:"morning"   },
    { id:"3c", icon:"💊", label:"Medication",                detail:"Warfarin — check dose on MAR. Any bruising to report immediately.", priority:"high",   shift:"morning"   },
    { id:"3d", icon:"🤲", label:"Comfort & Companionship",   detail:"Agnes has been distressed — spend time with her. Music therapy helps.", priority:"moderate",shift:"morning"   },
    { id:"3e", icon:"🔄", label:"Repositioning",             detail:"Arthritis — reposition every 2 hours. Gentle handling, note any pain.", priority:"moderate",shift:"morning"   },
    { id:"3f", icon:"🌙", label:"Night Check",               detail:"Agnes often wakes distressed at night — have 1950s playlist ready.", priority:"high",   shift:"night"     },
  ],
  4: [
    { id:"4a", icon:"💊", label:"Morning Medication",        detail:"Inhaler before activity. Check technique — COPD management.", priority:"high",   shift:"morning"   },
    { id:"4b", icon:"🍽", label:"Meal Monitoring",           detail:"Monitor dietary intake — diabetic diet. No sugary snacks.", priority:"high",   shift:"morning"   },
    { id:"4c", icon:"⚖",  label:"Blood Sugar Check",        detail:"Check blood glucose before breakfast and dinner. Record in chart.", priority:"high",   shift:"morning"   },
    { id:"4d", icon:"🏃", label:"Activity Encouragement",    detail:"Robert responds well to activities — encourage participation.", priority:"low",    shift:"afternoon" },
    { id:"4e", icon:"💊", label:"Evening Medication",        detail:"Inhaler and diabetes medication. Check blood sugar after dinner.", priority:"high",   shift:"afternoon" },
  ],
  5: [
    { id:"5a", icon:"🔄", label:"Pressure Area Check",       detail:"URGENT — Stage 1 redness on left heel. Check and document every shift.", priority:"high",   shift:"morning"   },
    { id:"5b", icon:"🛁", label:"Personal Care",             detail:"Full assistance needed. Skin check entire body — heart failure causes swelling.", priority:"high",   shift:"morning"   },
    { id:"5c", icon:"💊", label:"Morning Medication",        detail:"Heart medication — critical timing. Check for ankle swelling before giving.", priority:"high",   shift:"morning"   },
    { id:"5d", icon:"💧", label:"Fluid Monitoring",          detail:"Heart failure — strict fluid balance. Record all intake and output.", priority:"high",   shift:"morning"   },
    { id:"5e", icon:"💊", label:"Evening Medication",        detail:"Evening heart medication. Check breathing — report any shortness of breath.", priority:"high",   shift:"afternoon" },
    { id:"5f", icon:"🌙", label:"Night Check",               detail:"Check breathing and ankle swelling overnight. Heart failure can worsen at night.", priority:"high",   shift:"night"     },
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
const getGeminiKey = () => GEMINI_KEY;

const aiCall = async (system, msg, tok=1000) => {
  if (!GEMINI_KEY) throw new Error("NO_API_KEY");
  const prompt = `${system}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation. Just the raw JSON object.\n\n${msg}`;
  const isNewFormat = GEMINI_KEY.startsWith("AQ.");
const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const url = isNewFormat ? baseUrl : `${baseUrl}?key=${GEMINI_KEY}`;
  const headers = { "Content-Type": "application/json" };
  if (isNewFormat) headers["Authorization"] = `Bearer ${GEMINI_KEY}`;
  else headers["x-goog-api-key"] = GEMINI_KEY;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: tok + 500, temperature: 0.1 },
    safetySettings: [
      { category:"HARM_CATEGORY_HARASSMENT",        threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_HATE_SPEECH",       threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold:"BLOCK_NONE" },
      { category:"HARM_CATEGORY_DANGEROUS_CONTENT", threshold:"BLOCK_NONE" },
    ]
  };
  const r = await fetch(url, { method:"POST", headers, body:JSON.stringify(body) });
  if (!r.ok) {
    const err = await r.json().catch(()=>({}));
    throw new Error(err?.error?.message || `HTTP ${r.status}`);
  }
  const d = await r.json();
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function CareIQ() {
  const [user,setUser]           = useState(null);
  const [staff,setStaff]         = useState(SEED_STAFF);
  const [notes,setNotes]         = useState(SEED_NOTES);
  const [shifts,setShifts]       = useState(SEED_SHIFTS);
  const [mod,setMod]             = useState("dashboard");
  const [showReminder,setShowReminder] = useState(false);
  const [doneTasks,setDoneTasks] = useState({});
  const [apiKey,setApiKeyState]  = useState("");
  const [keyInput,setKeyInput]   = useState("");
  const [keyError,setKeyError]   = useState("");
  const [keyTesting,setKeyTesting] = useState(false);
  const reminderTimer            = useRef(null);

  const submitKey = async () => {
    if (!keyInput.trim()) return;
    setKeyError("");
    const k = keyInput.trim();
    // Accept both AIza (classic GCP) and AQ (newer AI Studio) formats
    if (!k.startsWith("AIza") && !k.startsWith("AQ.")) {
      setKeyError("Key should start with AIza or AQ — copy it exactly from aistudio.google.com/apikey");
      return;
    }
    setGeminiKey(k);
    setApiKeyState(k);
  };

  const login = u => {
    setUser(u);
    setMod(ROLES[u.role].access[0]);
    // Show reminder popup immediately on login for carers and seniors
    if (u.role === "carer" || u.role === "senior") {
      setShowReminder(true);
    }
  };

  const logout = () => {
    setUser(null);
    setDoneTasks({});
    setShowReminder(false);
    if (reminderTimer.current) clearInterval(reminderTimer.current);
  };

  const addNote = n => setNotes(p => [{...n, id:Date.now()}, ...p]);
  const can     = m => user && ROLES[user.role].access.includes(m);

  const markDone = (taskId) => {
    setDoneTasks(p => ({...p, [taskId]: true}));
  };

  const markUndone = (taskId) => {
    setDoneTasks(p => {const n={...p}; delete n[taskId]; return n;});
  };

  // Set up hourly reminder for carers
  useEffect(() => {
    if (!user || (user.role !== "carer" && user.role !== "senior")) return;
    if (reminderTimer.current) clearInterval(reminderTimer.current);
    // Remind every 60 minutes
    reminderTimer.current = setInterval(() => {
      setShowReminder(true);
    }, 60 * 60 * 1000);
    return () => clearInterval(reminderTimer.current);
  }, [user]);

  // Get tasks for this user's assigned residents
  const myResidentIds = user
    ? (user.role === "carer"
        ? (user.keyWorkers || [])
        : SEED_RESIDENTS.map(r => r.id))
    : [];

  const myTasks = myResidentIds.flatMap(rId => {
    const res = SEED_RESIDENTS.find(r => r.id === rId);
    return (RESIDENT_TASKS[rId] || []).map(t => ({...t, residentId:rId, residentName:res?.name}));
  });

  const pendingTasks = myTasks.filter(t => !doneTasks[t.id]);
  const completedCount = myTasks.filter(t => doneTasks[t.id]).length;

  if (!apiKey) return <GeminiSetup keyInput={keyInput} setKeyInput={setKeyInput} onSubmit={submitKey} error={keyError} testing={keyTesting}/>;
  if (!user) return <Login staff={staff} onLogin={login}/>;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Palatino Linotype',Palatino,serif"}}>

      {/* Task Reminder Popup */}
      {showReminder && (user.role === "carer" || user.role === "senior") && (
        <TaskReminder
          user={user}
          tasks={myTasks}
          doneTasks={doneTasks}
          onMarkDone={markDone}
          onMarkUndone={markUndone}
          onClose={() => setShowReminder(false)}
          pendingCount={pendingTasks.length}
          completedCount={completedCount}
        />
      )}

      {/* Sidebar */}
      <div style={{width:200,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"22px 20px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:8,letterSpacing:5,color:C.gold,textTransform:"uppercase",marginBottom:3}}>CareIQ</div>
          <div style={{fontSize:14,fontWeight:"bold"}}>Inspection Readiness</div>
        </div>
        <nav style={{flex:1,padding:"14px 10px"}}>
          {NAV.map(n => {
            const ok=can(n.id); const act=mod===n.id;
            return <button key={n.id} onClick={()=>ok&&setMod(n.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 11px",borderRadius:6,border:"none",background:act?C.goldDim:"transparent",color:!ok?C.muted:act?C.gold:C.soft,cursor:ok?"pointer":"not-allowed",fontSize:12,fontWeight:act?"bold":"normal",marginBottom:2,textAlign:"left",transition:"all 0.15s",fontFamily:"inherit"}}>
              <span style={{fontSize:14,opacity:ok?1:0.3}}>{n.icon}</span>{n.label}
              {!ok&&<span style={{marginLeft:"auto",fontSize:9,opacity:0.35}}>🔒</span>}
            </button>;
          })}
        </nav>
        {/* Task badge in sidebar */}
        {(user.role === "carer" || user.role === "senior") && (
          <button onClick={() => setShowReminder(true)}
            style={{margin:"0 10px 10px",padding:"10px 12px",background:pendingTasks.length > 0 ? C.high+"20" : C.eff+"20",border:`1px solid ${pendingTasks.length > 0 ? C.high+"50" : C.eff+"50"}`,borderRadius:8,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s"}}>
            <div style={{fontSize:8,letterSpacing:2,color:pendingTasks.length > 0 ? C.high : C.eff,textTransform:"uppercase",marginBottom:3}}>
              {pendingTasks.length > 0 ? "⚠ Tasks Pending" : "✓ All Done"}
            </div>
            <div style={{fontSize:11,fontWeight:"bold",color:C.text}}>{pendingTasks.length} remaining · {completedCount} done</div>
          </button>
        )}
        <div style={{padding:"14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:ROLES[user.role].color+"25",border:`1.5px solid ${ROLES[user.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:"bold",color:ROLES[user.role].color,flexShrink:0}}>{user.name[0]}</div>
            <div><div style={{fontSize:11,fontWeight:"bold",lineHeight:1.2}}>{user.name.split(" ")[0]}</div><div style={{fontSize:9,letterSpacing:2,color:ROLES[user.role].color}}>{ROLES[user.role].badge}</div></div>
          </div>
          <button onClick={logout} style={{width:"100%",padding:"6px",background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:8,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:2}}>{NAV.find(n=>n.id===mod)?.icon} {NAV.find(n=>n.id===mod)?.label}</div>
            <div style={{fontSize:16,fontWeight:"bold"}}>{mod==="dashboard"?"Compliance Overview":mod==="notes"?"Care Note Generator":mod==="residents"?"Resident Intelligence":mod==="evidence"?"Inspection Evidence Pack":"Staff Management"}</div>
          </div>
          <div style={{fontSize:10,color:C.soft}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{flex:1,overflow:"auto"}}>
          {!can(mod)&&<Locked role={user.role}/>}
          {can(mod)&&mod==="dashboard" &&<Dashboard notes={notes} user={user}/>}
          {can(mod)&&mod==="notes"     &&<Notes onSave={addNote} user={user}/>}
          {can(mod)&&mod==="residents" &&<Residents/>}
          {can(mod)&&mod==="evidence"  &&<Evidence notes={notes}/>}
          {can(mod)&&mod==="staff"     &&<Staff staff={staff} setStaff={setStaff} me={user} shifts={shifts} setShifts={setShifts}/>}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}textarea,input{box-sizing:border-box}textarea::placeholder,input::placeholder{color:${C.muted}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK REMINDER POPUP
// ─────────────────────────────────────────────────────────────────────────────
function TaskReminder({ user, tasks, doneTasks, onMarkDone, onMarkUndone, onClose, pendingCount, completedCount }) {
  const [filter, setFilter] = useState("pending"); // pending | all
  const [selResident, setSelResident] = useState("all");

  const residents = [...new Set(tasks.map(t => t.residentName))];
  const displayed = tasks
    .filter(t => filter === "all" || !doneTasks[t.id])
    .filter(t => selResident === "all" || t.residentName === selResident)
    .sort((a,b) => {
      const order = { high:0, moderate:1, low:2 };
      return order[a.priority] - order[b.priority];
    });

  const allDone = pendingCount === 0;
  const now = new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.2s ease"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,width:"100%",maxWidth:560,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>

        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,background:allDone ? C.eff+"15" : C.high+"10"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
            <div>
              <div style={{fontSize:9,letterSpacing:4,color:allDone ? C.eff : C.high,textTransform:"uppercase",marginBottom:4}}>
                {allDone ? "✓ All Tasks Complete" : "⚠ Shift Task Reminder"}
              </div>
              <div style={{fontSize:18,fontWeight:"bold",color:C.text}}>
                {allDone ? "Great work, " : "Hello, "}{user.name.split(" ")[0]}
              </div>
              <div style={{fontSize:11,color:C.soft,marginTop:2}}>{now} · {pendingCount} tasks pending · {completedCount} completed</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:6,cursor:"pointer",fontSize:13,padding:"5px 10px",fontFamily:"inherit",flexShrink:0}}>✕ Close</button>
          </div>

          {/* Progress bar */}
          <div style={{background:C.border,borderRadius:4,height:6,overflow:"hidden"}}>
            <div style={{width:`${tasks.length > 0 ? (completedCount/tasks.length)*100 : 0}%`,height:"100%",background:allDone ? C.eff : C.gold,borderRadius:4,transition:"width 0.5s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:9,color:C.soft}}>{completedCount} of {tasks.length} tasks completed</span>
            <span style={{fontSize:9,color:allDone ? C.eff : C.gold,fontWeight:"bold"}}>{tasks.length > 0 ? ~~((completedCount/tasks.length)*100) : 0}%</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",gap:5}}>
            {["pending","all"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{padding:"4px 12px",borderRadius:12,border:`1px solid ${filter===f ? C.gold : C.border}`,background:filter===f ? C.goldDim : "transparent",color:filter===f ? C.gold : C.soft,cursor:"pointer",fontSize:10,fontFamily:"inherit",textTransform:"capitalize"}}>
                {f === "pending" ? `Pending (${pendingCount})` : `All (${tasks.length})`}
              </button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <select value={selResident} onChange={e => setSelResident(e.target.value)}
            style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.text,fontSize:10,fontFamily:"inherit",outline:"none"}}>
            <option value="all">All Residents</option>
            {residents.map(r => <option key={r} value={r}>{r.split(" ")[0]}</option>)}
          </select>
        </div>

        {/* Task list */}
        <div style={{overflowY:"auto",flex:1,padding:"12px 16px"}}>
          {displayed.length === 0 && (
            <div style={{textAlign:"center",padding:"32px 20px"}}>
              <div style={{fontSize:32,marginBottom:10}}>✓</div>
              <div style={{fontSize:14,fontWeight:"bold",color:C.eff,marginBottom:4}}>All tasks complete!</div>
              <div style={{fontSize:12,color:C.soft}}>You've completed everything for this reminder period.</div>
            </div>
          )}
          {displayed.map(t => {
            const done = !!doneTasks[t.id];
            const pc = PRIORITY_C[t.priority] || C.soft;
            return (
              <div key={t.id} style={{background:done ? C.eff+"08" : C.card,border:`1px solid ${done ? C.eff+"30" : pc+"30"}`,borderRadius:9,padding:"13px 14px",marginBottom:9,opacity:done ? 0.7 : 1,transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  {/* Checkbox */}
                  <button onClick={() => done ? onMarkUndone(t.id) : onMarkDone(t.id)}
                    style={{width:24,height:24,borderRadius:6,border:`2px solid ${done ? C.eff : pc}`,background:done ? C.eff : "transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1,transition:"all 0.2s"}}>
                    {done && <span style={{fontSize:12,color:"white",fontWeight:"bold"}}>✓</span>}
                  </button>

                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:15}}>{t.icon}</span>
                      <span style={{fontSize:13,fontWeight:"bold",color:done ? C.soft : C.text,textDecoration:done?"line-through":"none"}}>{t.label}</span>
                      <span style={{fontSize:9,padding:"2px 7px",borderRadius:7,background:pc+"20",color:pc,fontWeight:"bold",textTransform:"uppercase"}}>{t.priority}</span>
                    </div>
                    <div style={{fontSize:11,color:C.gold,fontWeight:"bold",marginBottom:3}}>{t.residentName} · Room {SEED_RESIDENTS.find(r=>r.id===t.residentId)?.room}</div>
                    <div style={{fontSize:11,color:done ? C.muted : C.soft,lineHeight:1.6}}>{t.detail}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center"}}>
          <div style={{flex:1,fontSize:10,color:C.muted,lineHeight:1.5}}>
            This reminder will appear again in <strong style={{color:C.gold}}>1 hour</strong> if tasks remain. Tick each task when complete.
          </div>
          <button onClick={onClose} style={{padding:"9px 20px",background:C.gold,color:"#0D1825",border:"none",borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1,fontFamily:"inherit",flexShrink:0}}>
            {allDone ? "✓ Done" : "Dismiss for Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI SETUP SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function GeminiSetup({ keyInput, setKeyInput, onSubmit, error, testing }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Palatino Linotype',Palatino,serif",padding:24}}>
      <div style={{width:"100%",maxWidth:480,animation:"fadeIn 0.4s ease"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:9,letterSpacing:6,color:C.gold,textTransform:"uppercase",marginBottom:8}}>CareIQ Platform</div>
          <div style={{fontSize:26,fontWeight:"bold",color:C.text,marginBottom:4}}>Connect AI Engine</div>
          <div style={{fontSize:12,color:C.soft}}>Powered by Google Gemini — Free Tier</div>
        </div>

        {/* Setup card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:28}}>

          {/* Step 1 */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:"bold",color:C.bg,flexShrink:0}}>1</div>
              <div style={{fontSize:12,fontWeight:"bold",color:C.text}}>Get your free Gemini API key</div>
            </div>
            <div style={{marginLeft:34,fontSize:11,color:C.soft,lineHeight:1.7}}>
              Go to <span style={{color:C.gold,fontWeight:"bold"}}>aistudio.google.com</span> and sign in with any Google account. Click <strong style={{color:C.text}}>"Get API key"</strong> then <strong style={{color:C.text}}>"Create API key"</strong>. Copy the key — it starts with <span style={{fontFamily:"monospace",color:C.gold,fontSize:10}}>AIza...</span> or <span style={{fontFamily:"monospace",color:C.gold,fontSize:10}}>AQ.Ab8...</span>
            </div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
              style={{display:"inline-block",marginLeft:34,marginTop:8,padding:"6px 14px",background:C.gold+"20",border:`1px solid ${C.gold}50`,borderRadius:6,color:C.gold,fontSize:11,fontWeight:"bold",textDecoration:"none"}}>
              → Open Google AI Studio
            </a>
          </div>

          <div style={{height:1,background:C.border,marginBottom:20}}/>

          {/* Step 2 */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:"bold",color:C.bg,flexShrink:0}}>2</div>
              <div style={{fontSize:12,fontWeight:"bold",color:C.text}}>Paste your API key below</div>
            </div>
            <div style={{marginLeft:34}}>
              <input
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && onSubmit()}
                placeholder="AIzaSy..."
                style={{width:"100%",padding:"11px 13px",borderRadius:6,border:`1px solid ${error?C.high:C.border}`,background:C.bg,color:C.text,fontSize:13,fontFamily:"monospace",outline:"none",transition:"border-color 0.2s"}}
              />
              {error && <div style={{marginTop:6,fontSize:11,color:C.high}}>{error}</div>}
            </div>
          </div>

          <div style={{marginLeft:34}}>
            <button onClick={onSubmit} disabled={!keyInput.trim()}
              style={{width:"100%",padding:"12px",background:C.gold,color:C.bg,border:"none",borderRadius:7,cursor:"pointer",fontWeight:"bold",fontSize:13,letterSpacing:1,fontFamily:"inherit",transition:"all 0.2s",opacity:!keyInput.trim()?0.5:1}}>
              → Connect and Launch CareIQ
            </button>
          </div>
        </div>

        {/* Free tier note */}
        <div style={{marginTop:16,padding:"12px 16px",background:C.gold+"0A",border:`1px solid ${C.gold}20`,borderRadius:8}}>
          <div style={{fontSize:9,letterSpacing:2,color:C.gold,textTransform:"uppercase",marginBottom:4}}>Free Tier Limits</div>
          <div style={{fontSize:11,color:C.soft,lineHeight:1.7}}>
            Gemini 1.5 Flash free tier gives you <strong style={{color:C.text}}>1,500 requests per day</strong> and <strong style={{color:C.text}}>1 million tokens per minute</strong>. That is more than enough to run a full care home pilot for months at zero cost. Your key stays in your browser — it is never sent anywhere else.
          </div>
        </div>

        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function Login({staff,onLogin}) {
  const [step,setStep]   = useState("select");
  const [person,setPerson]= useState(null);
  const [pin,setPin]     = useState("");
  const [err,setErr]     = useState("");
  const [shake,setShake] = useState(false);

  const pick = p => { setPerson(p); setPin(""); setErr(""); setStep("pin"); };
  const digit = d => {
    if(pin.length>=4) return;
    const np=pin+d; setPin(np);
    if(np.length===4) setTimeout(()=>{ if(np===person.pin){onLogin(person);}else{setErr("Incorrect PIN — try again");setShake(true);setPin("");setTimeout(()=>setShake(false),500);} },150);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Palatino Linotype',Palatino,serif",padding:24}}>
      <div style={{width:"100%",maxWidth:460,animation:"fadeIn 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:9,letterSpacing:6,color:C.gold,textTransform:"uppercase",marginBottom:8}}>CareIQ Platform</div>
          <div style={{fontSize:26,fontWeight:"bold",marginBottom:5}}>Inspection Readiness</div>
          <div style={{fontSize:11,color:C.soft}}>Secure Staff Login · UK Care Homes</div>
        </div>
        {step==="select"&&(
          <div>
            <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>Select your name</div>
            {staff.filter(s=>s.active).map(s=>(
              <div key={s.id} onClick={()=>pick(s)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,marginBottom:7,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=ROLES[s.role].color;e.currentTarget.style.background=ROLES[s.role].color+"0D";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`2px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:"bold",color:ROLES[s.role].color,flexShrink:0}}>{s.name[0]}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:"bold"}}>{s.name}</div><div style={{fontSize:11,color:C.soft}}>{ROLES[s.role].label}</div></div>
                <div style={{fontSize:9,fontWeight:"bold",padding:"2px 9px",borderRadius:9,background:ROLES[s.role].color+"20",color:ROLES[s.role].color,letterSpacing:1}}>{ROLES[s.role].badge}</div>
              </div>
            ))}
            <div style={{marginTop:14,textAlign:"center",fontSize:10,color:C.muted}}>Demo PINs: Carer 1234 · Senior 3456 · Manager 4567 · Compliance 5678</div>
          </div>
        )}
        {step==="pin"&&person&&(
          <div style={{textAlign:"center"}}>
            <button onClick={()=>{setStep("select");setPin("");setErr("");}} style={{background:"none",border:"none",color:C.soft,cursor:"pointer",fontSize:11,marginBottom:18,fontFamily:"inherit"}}>← Back</button>
            <div style={{width:52,height:52,borderRadius:"50%",background:ROLES[person.role].color+"20",border:`2px solid ${ROLES[person.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:"bold",color:ROLES[person.role].color,margin:"0 auto 9px"}}>{person.name[0]}</div>
            <div style={{fontSize:16,fontWeight:"bold",marginBottom:2}}>{person.name}</div>
            <div style={{fontSize:9,color:ROLES[person.role].color,letterSpacing:2,marginBottom:24}}>{ROLES[person.role].badge}</div>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:20,animation:shake?"shake 0.4s ease":"none"}}>
              {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<pin.length?ROLES[person.role].color:C.border,transition:"background 0.1s"}}/>)}
            </div>
            {err&&<div style={{marginBottom:14,fontSize:12,color:C.high}}>{err}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:210,margin:"0 auto"}}>
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
                <button key={i} onClick={()=>d===""?null:d==="⌫"?setPin(p=>p.slice(0,-1)):digit(String(d))}
                  style={{padding:"15px",borderRadius:8,fontSize:17,fontWeight:"bold",background:d===""?C.bg:C.card,border:`1px solid ${d===""?C.bg:C.border}`,color:d===""?"transparent":d==="⌫"?C.soft:C.text,cursor:d===""?"default":"pointer",fontFamily:"inherit",transition:"all 0.1s"}}
                  onMouseEnter={e=>{if(d!=="")e.currentTarget.style.borderColor=ROLES[person.role].color;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=d===""?C.bg:C.border;}}
                >{d}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

function Locked({role}) {
  return <div style={{padding:80,textAlign:"center"}}><div style={{fontSize:42,marginBottom:14}}>🔒</div><div style={{fontSize:17,fontWeight:"bold",marginBottom:7}}>Access Restricted</div><div style={{fontSize:12,color:C.soft,lineHeight:1.9}}>This section is not available for <strong style={{color:ROLES[role].color}}>{ROLES[role].label}</strong>.<br/>Speak to your manager if you need access.</div></div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({notes,user}) {
  const [insight,setInsight]=useState(null);
  const [loading,setLoading]=useState(false);
  const scores   = Object.fromEntries(Object.keys(DOMAIN).map(d=>[d,dScore(notes,d)]));
  const overall  = oScore(notes);
  const rating   = rLabel(overall);
  const risks    = notes.flatMap(n=>(n.risk_flags||[]).map(r=>({...r,name:n.resident_name})));
  const isSenior = user.role==="senior";
  const rc       = RATING_C[rating]||C.gold;

  const runAI = async()=>{
    setLoading(true);
    try{
      const raw=await aiCall(`You are a CQC compliance expert. Return ONLY valid JSON no markdown:{"headline":"string","readiness":"Ready|At Risk|Critical","concerns":["s","s","s"],"strengths":["s","s"],"actions":["s","s","s"],"risk":"Low|Medium|High"}`,`Data: ${JSON.stringify({notes:notes.length,highRisks:risks.filter(r=>r.severity==="high").length,scores})}`);
      setInsight(JSON.parse(raw));
    }catch{}
    setLoading(false);
  };

  return(
    <div style={{padding:26,maxWidth:1100,margin:"0 auto",animation:"fadeIn 0.3s ease"}}>
      {!isSenior&&(
        <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:15,marginBottom:15}}>
          <Box style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:9}}>Score</div>
            <svg viewBox="0 0 90 90" width="90" height="90">
              <circle cx="45" cy="45" r="38" fill="none" stroke={C.border} strokeWidth="7"/>
              <circle cx="45" cy="45" r="38" fill="none" stroke={rc} strokeWidth="7" strokeDasharray={`${(overall/100)*238.8} 238.8`} strokeLinecap="round" transform="rotate(-90 45 45)"/>
            </svg>
            <div style={{fontSize:24,fontWeight:"bold",color:rc,marginTop:-8,lineHeight:1}}>{overall}</div>
            <div style={{fontSize:10,fontWeight:"bold",color:rc,marginTop:4,textAlign:"center"}}>{rating}</div>
          </Box>
          <Box style={{padding:20}}>
            <div style={{fontSize:8,letterSpacing:4,color:C.soft,textTransform:"uppercase",marginBottom:13}}>CQC Domain Scores</div>
            {Object.entries(scores).map(([d,s])=>(
              <div key={d} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:82,fontSize:11,color:C.soft,textAlign:"right"}}>{d}</div>
                <div style={{flex:1,background:C.bg,borderRadius:3,height:6}}><div style={{width:`${s}%`,height:"100%",background:DOMAIN[d].color,borderRadius:3,transition:"width 0.8s"}}/></div>
                <div style={{width:24,fontSize:11,fontWeight:"bold",color:DOMAIN[d].color,textAlign:"right"}}>{s}</div>
              </div>
            ))}
          </Box>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:15}}>
        {[{l:"Care Notes",val:notes.length,c:C.gold},{l:"High Risk",val:risks.filter(r=>r.severity==="high").length,c:C.high},{l:"Follow-Ups",val:notes.filter(n=>n.follow_up_required).length,c:C.mod},{l:"Residents",val:SEED_RESIDENTS.length,c:C.resp}].map(s=>(
          <Box key={s.l} style={{padding:17}}><div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:5}}>{s.l}</div><div style={{fontSize:28,fontWeight:"bold",color:s.c,lineHeight:1}}>{s.val}</div></Box>
        ))}
      </div>
      {!isSenior&&(
        <Box style={{padding:21,marginBottom:15}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:insight?13:0}}>
            <div style={{fontSize:8,letterSpacing:4,color:C.gold,textTransform:"uppercase"}}>AI Compliance Intelligence</div>
            {!insight&&<Btn onClick={runAI} loading={loading}>{loading?"Analysing…":"→ Run AI Analysis"}</Btn>}
          </div>
          {!insight&&!loading&&<div style={{fontSize:12,color:C.soft,marginTop:9}}>Click to get an instant compliance assessment — inspection readiness, risks, and recommended actions.</div>}
          {loading&&<div style={{marginTop:12}}><Dots/></div>}
          {insight&&(
            <div style={{animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",gap:13,marginBottom:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{flex:1,fontSize:13,color:C.text,lineHeight:1.8}}>{insight.headline}</div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <Chip label="READINESS" val={insight.readiness} color={insight.readiness==="Ready"?C.eff:insight.readiness==="At Risk"?C.mod:C.high}/>
                  <Chip label="RISK"      val={insight.risk}      color={insight.risk==="Low"?C.eff:insight.risk==="Medium"?C.mod:C.high}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                <Panel title="Key Concerns" items={insight.concerns} color={C.high} icon="⚠"/>
                <Panel title="Strengths"    items={insight.strengths} color={C.eff} icon="✓"/>
                <Panel title="Actions"      items={insight.actions}   color={C.gold} icon="→"/>
              </div>
            </div>
          )}
        </Box>
      )}
      <Box style={{padding:21}}>
        <div style={{fontSize:8,letterSpacing:4,color:C.soft,textTransform:"uppercase",marginBottom:13}}>Recent Activity</div>
        {[...notes].sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,6).map(n=>(
          <div key={n.id} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 12px",background:C.bg,borderRadius:6,border:`1px solid ${n.risk_flags?.some(r=>r.severity==="high")?C.high+"40":C.border}`,marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:n.risk_flags?.some(r=>r.severity==="high")?C.high:C.eff,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}><span style={{fontWeight:"bold",fontSize:12}}>{n.resident_name}</span><span style={{fontSize:11,color:C.soft,marginLeft:7}}>{n.observation?.substring(0,65)}…</span></div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>{n.cqc_domains?.slice(0,2).map(d=><DTag key={d} d={d} small/>)}</div>
            <div style={{fontSize:10,color:C.muted,width:50,textAlign:"right"}}>{ago(n.ts)}</div>
          </div>
        ))}
      </Box>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────────────────────
const NOTE_SYS=`You are an expert UK care home documentation AI. Convert raw carer speech or text into a structured SOAP care note aligned to CQC standards.
Return ONLY valid JSON no markdown:
{"resident_name":"string","timestamp":"ISO8601","subjective":"what resident said","objective":"factual observation","assessment":"clinical interpretation","plan":"actions and next steps","mood":"Calm|Agitated|Distressed|Happy|Confused|Withdrawn|Anxious","nutrition_hydration":"string or null","mobility":"string or null","risk_flags":[{"type":"fall|medication_refusal|aggression|safeguarding|infection|nutrition|confusion|pressure_sore|other","severity":"high|moderate|low","detail":"string"}],"cqc_domains":["Safe","Effective","Caring","Responsive","Well-Led"],"follow_up_required":true,"follow_up_notes":"string or null","compliance_notes":"string or null"}`;

const EXAMPLES=["Mary was a bit off this morning, said she felt dizzy, didn't eat much. Got her a drink and told the nurse.","John had a fall near the bathroom, no injuries but he was shaken. Helped him to his chair and called the nurse.","Agnes very distressed, crying for her daughter. Sat with her, played music, she calmed after 20 minutes.","Pressure area check on Edith — redness on left heel, repositioned and told senior staff."];

function Notes({onSave,user}) {
  const [input,setInput]=useState(""); const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState(null);
  const [saved,setSaved]=useState(false); const [isRec,setIsRec]=useState(false);
  const [vsup,setVsup]=useState(false); const [interim,setInterim]=useState("");
  const recRef=useRef(null);

  useEffect(()=>setVsup(!!(window.SpeechRecognition||window.webkitSpeechRecognition)),[]);

  const toggleRec=()=>{
    if(isRec){recRef.current?.stop();setIsRec(false);setInterim("");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR)return;
    const rec=new SR(); rec.lang="en-GB"; rec.continuous=true; rec.interimResults=true;
    let fin=input;
    rec.onresult=e=>{let int="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){fin+=(fin?" ":"")+e.results[i][0].transcript;setInput(fin);setInterim("");}else int+=e.results[i][0].transcript;}setInterim(int);};
    rec.onend=()=>{setIsRec(false);setInterim("");};
    recRef.current=rec; rec.start(); setIsRec(true);
  };

  const generate=async()=>{
    if(!input.trim())return; if(isRec){recRef.current?.stop();setIsRec(false);}
    setLoading(true);setErr(null);setResult(null);setSaved(false);
    try{const raw=await aiCall(NOTE_SYS,input);const p=JSON.parse(raw);if(!p.timestamp)p.timestamp=new Date().toISOString();setResult(p);}
    catch{setErr("Could not process note. Please try again.");}
    setLoading(false);
  };

  const save=()=>{
    if(!result)return;
    onSave({...result,observation:result.objective,residentId:SEED_RESIDENTS.find(r=>r.name===result.resident_name)?.id||0});
    setSaved(true);
  };

  return(
    <div style={{padding:26,maxWidth:1060,margin:"0 auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <Box style={{padding:22}}>
            <div style={{fontSize:8,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:13}}>Carer Note Input</div>
            {vsup&&<button onClick={toggleRec} style={{width:"100%",padding:"14px",borderRadius:8,marginBottom:12,border:`2px solid ${isRec?C.high:C.gold}`,background:isRec?C.high+"12":"transparent",color:isRec?C.high:C.gold,cursor:"pointer",fontSize:13,fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",gap:9,fontFamily:"inherit"}}>{isRec?<><Blink/> Stop Recording</>:<>🎤 Tap to Speak Note</>}</button>}
            {isRec&&interim&&<div style={{marginBottom:11,padding:"9px 12px",background:C.mod+"10",border:`1px solid ${C.mod}30`,borderRadius:5,fontSize:12,color:C.soft,fontStyle:"italic"}}>{interim}</div>}
            {vsup&&<div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:9,color:C.muted,letterSpacing:2}}>OR TYPE</span><div style={{flex:1,height:1,background:C.border}}/></div>}
            <textarea value={input+(interim?(input?" ":"")+interim:"")} onChange={e=>{if(!isRec)setInput(e.target.value);}} readOnly={isRec} placeholder="Type a care note exactly as you'd say it to a colleague…"
              style={{width:"100%",minHeight:105,padding:11,border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,fontFamily:"inherit",background:C.bg,color:C.text,resize:"vertical",outline:"none",lineHeight:1.7}}/>
            <div style={{display:"flex",gap:9,marginTop:11}}>
              <button onClick={generate} disabled={loading||!input.trim()} style={{flex:1,padding:"10px",background:loading?C.card:C.gold,color:loading?C.soft:"#0D1825",border:"none",borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1,fontFamily:"inherit"}}>
                {loading?"Processing…":"→ Generate SOAP Note"}
              </button>
              {input&&<button onClick={()=>{setInput("");setResult(null);setErr(null);setInterim("");}} style={{padding:"9px 12px",background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Clear</button>}
            </div>
            {err&&<div style={{marginTop:9,padding:9,background:C.high+"12",border:`1px solid ${C.high}40`,borderRadius:5,color:C.high,fontSize:12}}>{err}</div>}
          </Box>
          <Box style={{padding:18}}>
            <div style={{fontSize:8,letterSpacing:4,color:C.soft,textTransform:"uppercase",marginBottom:11}}>Example Notes</div>
            {EXAMPLES.map((e,i)=>(
              <div key={i} onClick={()=>{if(!isRec){setInput(e);setResult(null);}}}
                style={{padding:"8px 11px",marginBottom:5,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,fontSize:11,cursor:"pointer",color:C.soft,lineHeight:1.5,transition:"border-color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                "{e.substring(0,82)}…"
              </div>
            ))}
          </Box>
        </div>
        <div>
          {!result&&!loading&&<Box style={{padding:42,textAlign:"center",border:`1px dashed ${C.gold}40`}}><div style={{fontSize:34,marginBottom:12}}>◎</div><div style={{fontSize:12,color:C.soft,lineHeight:2}}>Speak or type a carer note<br/>then click <strong style={{color:C.text}}>Generate SOAP Note</strong><br/><br/><span style={{fontSize:11,color:C.muted}}>✓ SOAP documentation · ✓ CQC domains<br/>✓ Risk detection · ✓ Follow-up alerts</span></div></Box>}
          {loading&&<Box style={{padding:42,textAlign:"center"}}><Dots/><div style={{marginTop:12,fontSize:12,color:C.soft}}>Structuring your note…</div></Box>}
          {result&&(
            <div style={{display:"flex",flexDirection:"column",gap:11,animation:"fadeIn 0.3s ease"}}>
              <Box style={{padding:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:2}}>SOAP Care Note</div><div style={{fontSize:17,fontWeight:"bold"}}>{result.resident_name}</div><div style={{fontSize:11,color:C.soft}}>{fmt(result.timestamp)}</div></div>
                  <div style={{textAlign:"right"}}>
                    <div style={{padding:"4px 10px",borderRadius:4,background:(MOOD_C[result.mood]||C.soft)+"20",color:MOOD_C[result.mood]||C.soft,fontSize:11,fontWeight:"bold"}}>{result.mood}</div>
                    {result.follow_up_required&&<div style={{marginTop:4,fontSize:10,color:C.high,fontWeight:"bold"}}>⚠ FOLLOW-UP REQUIRED</div>}
                  </div>
                </div>
              </Box>
              <Box style={{padding:17}}>
                {[["Subjective",result.subjective],["Objective",result.objective],["Assessment",result.assessment],["Plan",result.plan]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} style={{marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:3}}>{k}</div>
                    <div style={{fontSize:12,lineHeight:1.7,color:C.text}}>{v}</div>
                  </div>
                ))}
              </Box>
              <Box style={{padding:13}}>
                <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:9}}>CQC Domains Tagged</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{Object.keys(DOMAIN).map(d=>{const a=result.cqc_domains?.includes(d);return <div key={d} style={{padding:"5px 11px",borderRadius:5,background:a?DOMAIN[d].color+"18":"transparent",border:`1px solid ${a?DOMAIN[d].color:C.border}`,color:a?DOMAIN[d].color:C.muted,fontSize:11,fontWeight:a?"bold":"normal"}}>{d}</div>;})}</div>
              </Box>
              {result.risk_flags?.length>0&&(
                <Box style={{padding:13}}>
                  <div style={{fontSize:8,letterSpacing:3,color:C.high,textTransform:"uppercase",marginBottom:9}}>Risk Flags</div>
                  {result.risk_flags.map((r,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:RISK_C[r.severity]+"12",border:`1px solid ${RISK_C[r.severity]}30`,borderRadius:5,marginBottom:5}}><span style={{fontSize:9,fontWeight:"bold",padding:"2px 6px",borderRadius:3,background:RISK_C[r.severity],color:"white",whiteSpace:"nowrap",flexShrink:0}}>{r.severity.toUpperCase()}</span><span style={{fontSize:12,color:C.soft,textTransform:"capitalize"}}>{r.type?.replace(/_/g," ")} — {r.detail}</span></div>)}
                </Box>
              )}
              <button onClick={save} disabled={saved} style={{padding:"11px",background:saved?C.eff+"20":C.gold,color:saved?C.eff:"#0D1825",border:`1px solid ${saved?C.eff:C.gold}`,borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1,fontFamily:"inherit",transition:"all 0.2s"}}>
                {saved?"✓ Saved to Dashboard":"→ Save Note to Dashboard"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESIDENTS
// ─────────────────────────────────────────────────────────────────────────────
const PAT_SYS=`You are a care home AI analyst. Study this resident's care history and identify patterns. Return ONLY valid JSON no markdown:
{"patterns":[{"title":"string","description":"string","confidence":"High|Medium|Low","category":"Medication|Mood|Nutrition|Mobility|Social|Cognitive"}],"correlations":[{"trigger":"string","effect":"string","strength":"Strong|Moderate|Weak"}],"deterioration_risk":"Low|Medium|High|Critical","predicted_next_7_days":"string","deterioration_signals":["string"],"recommended_interventions":["string"],"family_insight":"string"}`;

function Residents() {
  const [sel,setSel]=useState(SEED_RESIDENTS[0].id);
  const [view,setView]=useState("profile");
  const [analysis,setAnalysis]=useState({});
  const [loading,setLoading]=useState({});
  const resident=SEED_RESIDENTS.find(r=>r.id===sel);
  const history=RESIDENT_HISTORY[sel]||[];
  const ai_data=analysis[sel];
  const avgFluid=history.length?~~(history.reduce((s,h)=>s+h.fluid,0)/history.length):0;
  const avgFood =history.length?~~(history.reduce((s,h)=>s+h.food,0)/history.length):0;

  const runAI=async()=>{
    setLoading(l=>({...l,[sel]:true}));
    try{const raw=await aiCall(PAT_SYS,`Resident: ${resident.name}, Age: ${resident.age}\nHistory: ${JSON.stringify(history)}`,1200);setAnalysis(a=>({...a,[sel]:JSON.parse(raw)}));}
    catch{}
    setLoading(l=>({...l,[sel]:false}));
  };

  const DET_C={Low:C.eff,Medium:C.mod,High:C.high,Critical:"#7F1D1D"};
  const CAT_C={Medication:C.high,Mood:C.wl,Nutrition:C.mod,Mobility:C.resp,Social:C.care,Cognitive:"#F97316"};

  return(
    <div style={{display:"flex",height:"calc(100vh - 110px)",animation:"fadeIn 0.3s ease"}}>
      <div style={{width:210,borderRight:`1px solid ${C.border}`,padding:12,overflowY:"auto",flexShrink:0}}>
        <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:10}}>Residents</div>
        {SEED_RESIDENTS.map(r=>{
          const h=RESIDENT_HISTORY[r.id]||[];
          const isS=sel===r.id;
          return <div key={r.id} onClick={()=>{setSel(r.id);setView("profile");}}
            style={{padding:"10px 12px",borderRadius:7,border:`1px solid ${isS?C.gold:C.border}`,background:isS?C.goldDim:C.card,marginBottom:6,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{if(!isS)e.currentTarget.style.borderColor=C.gold+"60";}} onMouseLeave={e=>{if(!isS)e.currentTarget.style.borderColor=C.border;}}>
            <div style={{fontSize:11,fontWeight:"bold",color:isS?C.gold:C.text,marginBottom:2}}>{r.name}</div>
            <div style={{fontSize:9,color:C.muted}}>Room {r.room} · {r.age}y</div>
            {h.some(x=>x.risk==="high")&&<div style={{fontSize:9,color:C.high,marginTop:3}}>● High risk</div>}
          </div>;
        })}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",gap:4}}>
          {[{id:"profile",l:"Profile & History"},{id:"patterns",l:"✦ AI Pattern Analysis"}].map(t=>(
            <button key={t.id} onClick={()=>setView(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"12px 10px",color:view===t.id?C.gold:C.soft,fontSize:11,fontWeight:view===t.id?"bold":"normal",borderBottom:view===t.id?`2px solid ${C.gold}`:"2px solid transparent",fontFamily:"inherit"}}>
              {t.l}
            </button>
          ))}
        </div>
        <div style={{padding:22}}>
          {view==="profile"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn 0.3s ease"}}>
              <Box style={{padding:20}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:50,height:50,borderRadius:"50%",background:C.gold+"20",border:`2px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:"bold",color:C.gold,flexShrink:0}}>
                    {resident.name.split(" ").map(w=>w[0]).join("")}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:18,fontWeight:"bold",marginBottom:2}}>{resident.name}</div>
                    <div style={{fontSize:11,color:C.soft,marginBottom:8}}>Room {resident.room} · Age {resident.age}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{resident.conditions.map(c=><span key={c} style={{fontSize:9,padding:"2px 8px",borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.soft}}>{c}</span>)}</div>
                    <div style={{fontSize:11,color:C.soft}}><span style={{color:C.muted}}>Family:</span> {resident.family}</div>
                  </div>
                </div>
                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:5}}>Preferences</div>
                  <div style={{fontSize:12,color:C.soft,lineHeight:1.7}}>{resident.preferences}</div>
                </div>
              </Box>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11}}>
                <Box style={{padding:15,textAlign:"center"}}><div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:5}}>Avg Fluid</div><div style={{fontSize:22,fontWeight:"bold",color:avgFluid<65?C.high:C.eff}}>{avgFluid}%</div></Box>
                <Box style={{padding:15,textAlign:"center"}}><div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:5}}>Avg Food</div><div style={{fontSize:22,fontWeight:"bold",color:avgFood<60?C.high:C.eff}}>{avgFood}%</div></Box>
                <Box style={{padding:15,textAlign:"center"}}><div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:5}}>High Risk</div><div style={{fontSize:22,fontWeight:"bold",color:C.high}}>{history.filter(h=>h.risk==="high").length}</div></Box>
              </div>
              <Box style={{padding:19}}>
                <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:13}}>Care History Timeline</div>
                {history.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:12,paddingBottom:13,marginBottom:13,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:RISK_C[h.risk]||C.muted,marginTop:3}}/>
                      {i<history.length-1&&<div style={{width:1,flex:1,background:C.border,marginTop:3}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                        <span style={{fontSize:11,fontWeight:"bold"}}>{h.date}</span>
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:(MOOD_C[h.mood]||C.soft)+"20",color:MOOD_C[h.mood]||C.soft}}>{h.mood}</span>
                        {h.risk!=="none"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:RISK_C[h.risk]+"20",color:RISK_C[h.risk],fontWeight:"bold",textTransform:"uppercase"}}>{h.risk}</span>}
                        <span style={{fontSize:9,color:C.resp}}>💧{h.fluid}%</span>
                        <span style={{fontSize:9,color:C.eff}}>🍽{h.food}%</span>
                      </div>
                      <div style={{fontSize:12,color:C.soft,lineHeight:1.6}}>{h.note}</div>
                    </div>
                  </div>
                ))}
              </Box>
            </div>
          )}
          {view==="patterns"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn 0.3s ease"}}>
              {!ai_data&&!loading[sel]&&(
                <Box style={{padding:42,textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:12}}>✦</div>
                  <div style={{fontSize:15,fontWeight:"bold",marginBottom:7}}>AI Pattern Analysis</div>
                  <div style={{fontSize:12,color:C.soft,lineHeight:1.8,marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>The AI will read all {history.length} care notes for {resident.name} and detect behavioural patterns, correlations, and early deterioration signals.</div>
                  <Btn onClick={runAI}>→ Analyse {resident.name.split(" ")[0]}'s History</Btn>
                </Box>
              )}
              {loading[sel]&&<Box style={{padding:42,textAlign:"center"}}><Dots/><div style={{marginTop:12,fontSize:12,color:C.soft}}>Analysing {history.length} notes…</div></Box>}
              {ai_data&&(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:13}}>
                    <Box style={{padding:17,textAlign:"center",border:`1px solid ${DET_C[ai_data.deterioration_risk]||C.border}40`}}>
                      <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:7}}>Risk</div>
                      <div style={{fontSize:26,fontWeight:"bold",color:DET_C[ai_data.deterioration_risk]||C.gold}}>{ai_data.deterioration_risk}</div>
                    </Box>
                    <Box style={{padding:17}}>
                      <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:7}}>Predicted Next 7 Days</div>
                      <div style={{fontSize:13,color:C.text,lineHeight:1.8}}>{ai_data.predicted_next_7_days}</div>
                    </Box>
                  </div>
                  <Box style={{padding:19}}>
                    <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:13}}>Patterns Detected ({ai_data.patterns?.length})</div>
                    {ai_data.patterns?.map((p,i)=>(
                      <div key={i} style={{padding:"12px 14px",background:C.bg,borderLeft:`3px solid ${CAT_C[p.category]||C.gold}`,borderRadius:"0 6px 6px 0",marginBottom:9}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                          <span style={{fontSize:9,padding:"2px 7px",borderRadius:8,background:(CAT_C[p.category]||C.gold)+"20",color:CAT_C[p.category]||C.gold,fontWeight:"bold",textTransform:"uppercase"}}>{p.category}</span>
                          <span style={{fontSize:12,fontWeight:"bold"}}>{p.title}</span>
                          <span style={{marginLeft:"auto",fontSize:9,color:C.soft}}>{p.confidence} confidence</span>
                        </div>
                        <div style={{fontSize:12,color:C.soft,lineHeight:1.7}}>{p.description}</div>
                      </div>
                    ))}
                  </Box>
                  {ai_data.correlations?.length>0&&(
                    <Box style={{padding:19}}>
                      <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:13}}>Cause & Effect</div>
                      {ai_data.correlations.map((c,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",background:C.bg,borderRadius:6,border:`1px solid ${C.border}`,marginBottom:7}}>
                          <div style={{flex:1,fontSize:12,color:C.high}}><div style={{fontSize:7,color:C.muted,marginBottom:1,letterSpacing:2}}>WHEN</div>{c.trigger}</div>
                          <div style={{fontSize:16,color:C.gold}}>→</div>
                          <div style={{flex:1,fontSize:12,color:C.eff}}><div style={{fontSize:7,color:C.muted,marginBottom:1,letterSpacing:2}}>THEN</div>{c.effect}</div>
                        </div>
                      ))}
                    </Box>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <Box style={{padding:17}}><div style={{fontSize:8,letterSpacing:3,color:C.high,textTransform:"uppercase",marginBottom:11}}>Early Warning Signals</div>{ai_data.deterioration_signals?.map((s,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7}}><span style={{color:C.high,flexShrink:0}}>⚠</span><span style={{fontSize:12,color:C.soft,lineHeight:1.5}}>{s}</span></div>)}</Box>
                    <Box style={{padding:17}}><div style={{fontSize:8,letterSpacing:3,color:C.eff,textTransform:"uppercase",marginBottom:11}}>Recommended Interventions</div>{ai_data.recommended_interventions?.map((s,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7}}><span style={{color:C.gold,flexShrink:0}}>→</span><span style={{fontSize:12,color:C.soft,lineHeight:1.5}}>{s}</span></div>)}</Box>
                  </div>
                  {ai_data.family_insight&&<Box style={{padding:15,border:`1px solid ${C.gold}30`,background:C.gold+"06"}}><div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:5}}>Family Insight</div><div style={{fontSize:13,color:C.text,lineHeight:1.8,fontStyle:"italic"}}>"{ai_data.family_insight}"</div></Box>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE
// ─────────────────────────────────────────────────────────────────────────────
const EV_SYS=`You are a CQC compliance specialist preparing an inspection evidence pack. Return ONLY valid JSON no markdown:
{"inspector_statement":"2-3 sentence opening for inspector","executive_summary":"3-4 sentences on compliance position","evidence_statements":["6 statements starting We demonstrate..."],"strengths_narrative":"2-3 sentences on strongest domains","improvement_narrative":"2-3 sentences on areas being addressed"}`;

function Evidence({notes}) {
  const [pack,setPack]=useState(null); const [loading,setLoading]=useState(false);
  const scores=Object.fromEntries(Object.keys(DOMAIN).map(d=>[d,dScore(notes,d)]));
  const overall=oScore(notes);
  const todayStr=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  const gen=async()=>{
    setLoading(true);
    try{const raw=await aiCall(EV_SYS,`Scores:${JSON.stringify(scores)},Overall:${overall},Rating:${rLabel(overall)},Notes:${notes.length}`,1000);setPack(JSON.parse(raw));}
    catch{}
    setLoading(false);
  };

  return(
    <div style={{padding:26,maxWidth:900,margin:"0 auto",animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div style={{fontSize:12,color:C.soft}}>Generate a complete, inspector-ready evidence document from your care data.</div>
        {!pack?<Btn onClick={gen} loading={loading}>{loading?"Generating…":"→ Generate Evidence Pack"}</Btn>:<Btn onClick={()=>setPack(null)}>↺ Regenerate</Btn>}
      </div>
      <Box style={{padding:22,marginBottom:14}}>
        <div style={{textAlign:"center",marginBottom:18,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:8,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:4}}>Confidential — CQC Inspection Evidence</div>
          <div style={{fontSize:20,fontWeight:"bold",marginBottom:2}}>Compliance Evidence Pack</div>
          <div style={{fontSize:11,color:C.soft}}>Generated: {todayStr} · {notes.length} care notes · {SEED_RESIDENTS.length} residents</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9}}>
          {Object.entries(scores).map(([d,s])=>(
            <div key={d} style={{textAlign:"center",padding:"13px 7px",background:C.bg,border:`1px solid ${DOMAIN[d].color}30`,borderRadius:7}}>
              <div style={{fontSize:8,color:DOMAIN[d].color,fontWeight:"bold",marginBottom:6,letterSpacing:1}}>{d.toUpperCase()}</div>
              <div style={{fontSize:24,fontWeight:"bold",color:DOMAIN[d].color,lineHeight:1}}>{s}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:4}}>{rLabel(s)}</div>
            </div>
          ))}
        </div>
      </Box>
      {loading&&<Box style={{padding:42,textAlign:"center"}}><Dots/><div style={{marginTop:12,fontSize:12,color:C.soft}}>Generating evidence narratives…</div></Box>}
      {pack&&(
        <div style={{display:"flex",flexDirection:"column",gap:13,animation:"fadeIn 0.3s ease"}}>
          <Box style={{padding:20}}><div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:9}}>Inspector Opening Statement</div><div style={{fontSize:13,color:C.text,lineHeight:1.9,fontStyle:"italic",paddingLeft:14,borderLeft:`3px solid ${C.gold}`}}>{pack.inspector_statement}</div></Box>
          <Box style={{padding:20}}><div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:9}}>Executive Summary</div><div style={{fontSize:13,color:C.text,lineHeight:1.9}}>{pack.executive_summary}</div></Box>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
            <Box style={{padding:17}}><div style={{fontSize:8,letterSpacing:3,color:C.eff,textTransform:"uppercase",marginBottom:9}}>Strengths</div><div style={{fontSize:12,color:C.soft,lineHeight:1.8}}>{pack.strengths_narrative}</div></Box>
            <Box style={{padding:17}}><div style={{fontSize:8,letterSpacing:3,color:C.mod,textTransform:"uppercase",marginBottom:9}}>Areas Being Addressed</div><div style={{fontSize:12,color:C.soft,lineHeight:1.8}}>{pack.improvement_narrative}</div></Box>
          </div>
          <Box style={{padding:19}}>
            <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:13}}>Evidence Statements</div>
            {pack.evidence_statements?.map((s,i)=><div key={i} style={{display:"flex",gap:9,padding:"8px 11px",background:C.bg,borderRadius:5,marginBottom:6}}><span style={{color:C.eff,flexShrink:0}}>✓</span><span style={{fontSize:12,color:C.soft,lineHeight:1.6}}>{s}</span></div>)}
          </Box>
          <Box style={{padding:19}}>
            <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:11}}>Recent Care Notes</div>
            {notes.slice(0,5).map(n=>(
              <div key={n.id} style={{padding:"9px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontWeight:"bold",fontSize:12}}>{n.resident_name}</span><span style={{fontSize:10,color:C.soft}}>{fmt(n.ts)}</span></div>
                <div style={{fontSize:11,color:C.soft,marginBottom:2}}>{n.observation}</div>
                <div style={{fontSize:11,color:C.muted}}>Action: {n.action_taken}</div>
              </div>
            ))}
          </Box>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — with key workers + shift builder built in
// ─────────────────────────────────────────────────────────────────────────────
const SI = { morning:"🌅", afternoon:"☀", night:"🌙" };
const ST = { morning:"07:00–14:30", afternoon:"14:00–21:30", night:"21:00–07:30" };
const SC = { morning:C.mod, afternoon:C.resp, night:C.wl };

function Staff({staff,setStaff,me,shifts,setShifts}) {
  const [tab,setTab]         = useState("list");
  const [subview,setSubview] = useState("list");
  const [edit,setEdit]       = useState(null);
  const [form,setForm]       = useState({name:"",role:"carer",pin:"",active:true});
  const [saved,setSaved]     = useState(false);
  const [selS,setSelS]       = useState(null);
  const [kwOk,setKwOk]       = useState(false);
  const [bld,setBld]         = useState(false);
  const [selSh,setSelSh]     = useState(null);
  const [ns,setNs]           = useState({date:TD,shift:"morning",assignments:[]});

  // staff crud
  const doSave=()=>{
    if(!form.name||form.pin.length!==4)return;
    if(edit) setStaff(p=>p.map(s=>s.id===edit?{...s,...form}:s));
    else setStaff(p=>[...p,{...form,id:Date.now(),lastLogin:"Never",keyWorkers:[],initials:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}]);
    setSaved(true); setTimeout(()=>{setSubview("list");setSaved(false);},800);
  };
  const toggleActive=id=>{if(id===me.id)return;setStaff(p=>p.map(s=>s.id===id?{...s,active:!s.active}:s));};

  // key workers
  const toggleKW=(sId,rId)=>{setStaff(p=>p.map(s=>{if(s.id!==sId)return s;const kw=s.keyWorkers||[];return{...s,keyWorkers:kw.includes(rId)?kw.filter(x=>x!==rId):[...kw,rId]};} ));setKwOk(false);};
  const kwOf=rId=>staff.find(s=>(s.keyWorkers||[]).includes(rId));

  // shifts
  const addSt  =sId=>setNs(n=>({...n,assignments:n.assignments.find(a=>a.staffId===sId)?n.assignments:[...n.assignments,{staffId:sId,residentIds:[]}]}));
  const remSt  =sId=>setNs(n=>({...n,assignments:n.assignments.filter(a=>a.staffId!==sId)}));
  const togRes =(sId,rId)=>setNs(n=>({...n,assignments:n.assignments.map(a=>a.staffId!==sId?a:{...a,residentIds:a.residentIds.includes(rId)?a.residentIds.filter(r=>r!==rId):[...a.residentIds,rId]})}));
  const saveSh =()=>{
    if(!ns.assignments.length)return;
    const shiftLabel=ns.shift.charAt(0).toUpperCase()+ns.shift.slice(1)+" Shift";
    setShifts(p=>[...p,{id:Date.now(),...ns,label:shiftLabel,time:ST[ns.shift],status:"upcoming"}]);
    setBld(false); setNs({date:TD,shift:"morning",assignments:[]});
  };
  const remFromSh=(shId,sId)=>setShifts(p=>p.map(sh=>sh.id!==shId?sh:{...sh,assignments:sh.assignments.filter(a=>a.staffId!==sId)}));
  const uncovered=sh=>SEED_RESIDENTS.filter(r=>!new Set(sh.assignments.flatMap(a=>a.residentIds)).has(r.id));

  return(
    <div style={{padding:26,maxWidth:1060,margin:"0 auto",animation:"fadeIn 0.3s ease"}}>
      {/* Tab bar */}
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${C.border}`}}>
        {[{id:"list",l:"👤 Staff Members"},{id:"keyworkers",l:"♥ Key Workers"},{id:"shifts",l:"◷ Shifts & Rota"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSubview("list");setSelS(null);setBld(false);setSelSh(null);}}
            style={{background:"none",border:"none",cursor:"pointer",padding:"9px 14px",color:tab===t.id?C.gold:C.soft,fontSize:11,fontWeight:tab===t.id?"bold":"normal",borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",fontFamily:"inherit",marginBottom:-1}}>
            {t.l}
          </button>
        ))}
        <div style={{flex:1}}/>
        {tab==="list"&&subview==="list"&&<button onClick={()=>{setForm({name:"",role:"carer",pin:"",active:true});setEdit(null);setSaved(false);setSubview("form");}} style={{padding:"7px 16px",background:C.gold,color:"#0D1825",border:"none",borderRadius:5,cursor:"pointer",fontWeight:"bold",fontSize:11,fontFamily:"inherit",marginBottom:8}}>+ Add Staff</button>}
        {tab==="list"&&subview!=="list"&&<button onClick={()=>setSubview("list")} style={{padding:"7px 14px",background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"inherit",marginBottom:8}}>← Back</button>}
        {tab==="shifts"&&!bld&&<button onClick={()=>setBld(true)} style={{padding:"7px 16px",background:C.gold,color:"#0D1825",border:"none",borderRadius:5,cursor:"pointer",fontWeight:"bold",fontSize:11,fontFamily:"inherit",marginBottom:8}}>+ Build Shift</button>}
      </div>

      {/* ── LIST ── */}
      {tab==="list"&&subview==="list"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
            {Object.entries(ROLES).map(([key,r])=>{const n=staff.filter(s=>s.role===key&&s.active).length;return <Box key={key} style={{padding:15,textAlign:"center"}}><div style={{fontSize:24,fontWeight:"bold",color:r.color}}>{n}</div><div style={{fontSize:8,letterSpacing:2,color:r.color,marginTop:3,textTransform:"uppercase"}}>{r.badge}</div></Box>;})}
          </div>
          <Box style={{padding:0,overflow:"hidden",marginBottom:14}}>
            <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase"}}>All Staff Members</div>
            {staff.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:`1px solid ${C.border}10`,opacity:s.active?1:0.4}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`1.5px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",color:ROLES[s.role].color,flexShrink:0}}>{s.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:"bold"}}>{s.name}</div>
                  <div style={{fontSize:10,color:C.soft}}>{ROLES[s.role].label} · {s.lastLogin}</div>
                  {(s.keyWorkers||[]).length>0&&<div style={{fontSize:9,color:C.gold,marginTop:2}}>♥ {(s.keyWorkers||[]).map(id=>SEED_RESIDENTS.find(r=>r.id===id)?.name?.split(" ")[0]).filter(Boolean).join(", ")}</div>}
                </div>
                <div style={{fontSize:9,fontWeight:"bold",padding:"2px 9px",borderRadius:9,background:ROLES[s.role].color+"20",color:ROLES[s.role].color,letterSpacing:1}}>{ROLES[s.role].badge}</div>
                <div style={{fontSize:9,color:s.active?C.eff:C.high,fontWeight:"bold",width:56,textAlign:"center"}}>{s.active?"ACTIVE":"INACTIVE"}</div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setForm({...s});setEdit(s.id);setSaved(false);setSubview("form");}} style={{padding:"4px 10px",background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Edit</button>
                  {s.id!==me.id&&<button onClick={()=>toggleActive(s.id)} style={{padding:"4px 10px",background:"none",border:`1px solid ${s.active?C.high+"40":C.eff+"40"}`,color:s.active?C.high:C.eff,borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{s.active?"Deactivate":"Activate"}</button>}
                </div>
              </div>
            ))}
          </Box>
          <Box style={{padding:18}}>
            <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:12}}>Role Permissions</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>{["Module","CARER","SENIOR","MANAGER","COMPLIANCE"].map(h=><th key={h} style={{padding:"7px 11px",textAlign:h==="Module"?"left":"center",fontSize:8,letterSpacing:2,color:h==="Module"?C.soft:Object.values(ROLES).find(r=>r.badge===h)?.color,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{[{l:"Note Generator",id:"notes"},{l:"Dashboard",id:"dashboard"},{l:"Resident Intelligence",id:"residents"},{l:"Evidence Pack",id:"evidence"},{l:"Staff Manager",id:"staff"}].map(m=>(
                <tr key={m.id} style={{borderBottom:`1px solid ${C.border}10`}}>
                  <td style={{padding:"8px 11px",color:C.soft,fontSize:11}}>{m.l}</td>
                  {Object.values(ROLES).map((r,i)=><td key={i} style={{padding:"8px 11px",textAlign:"center"}}>{r.access.includes(m.id)?<span style={{color:C.eff}}>✓</span>:<span style={{color:C.border}}>✗</span>}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </Box>
        </>
      )}

      {/* ── FORM ── */}
      {tab==="list"&&subview==="form"&&(
        <Box style={{padding:26,maxWidth:440}}>
          <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:16}}>{edit?"Edit Staff Member":"Add New Staff Member"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:6}}>Full Name</div><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sarah Thompson" style={{width:"100%",padding:"10px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/></div>
            <div>
              <div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:8}}>Role</div>
              {Object.entries(ROLES).map(([key,r])=>(
                <div key={key} onClick={()=>setForm({...form,role:key})} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 12px",borderRadius:6,border:`1px solid ${form.role===key?r.color:C.border}`,background:form.role===key?r.color+"0D":"transparent",cursor:"pointer",marginBottom:6,transition:"all 0.15s"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",border:`2px solid ${r.color}`,background:form.role===key?r.color:"transparent",flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:"bold",color:form.role===key?r.color:C.text}}>{r.label}</div></div>
                  <div style={{fontSize:8,fontWeight:"bold",padding:"2px 7px",borderRadius:7,background:r.color+"20",color:r.color}}>{r.badge}</div>
                </div>
              ))}
            </div>
            <div><div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:6}}>4-Digit PIN</div><input type="password" value={form.pin} onChange={e=>setForm({...form,pin:e.target.value.replace(/\D/g,"").slice(0,4)})} placeholder="4 digits" style={{width:"100%",padding:"10px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:18,fontFamily:"inherit",outline:"none",letterSpacing:10}}/>{form.pin&&form.pin.length!==4&&<div style={{fontSize:10,color:C.high,marginTop:3}}>Must be exactly 4 digits</div>}</div>
            <button onClick={doSave} disabled={!form.name||form.pin.length!==4} style={{padding:"11px",background:saved?C.eff+"20":C.gold,color:saved?C.eff:"#0D1825",border:`1px solid ${saved?C.eff:C.gold}`,borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:12,letterSpacing:1,fontFamily:"inherit",transition:"all 0.2s",opacity:(!form.name||form.pin.length!==4)?0.5:1}}>{saved?"✓ Saved!":edit?"Save Changes":"Add Staff Member"}</button>
          </div>
        </Box>
      )}

      {/* ── KEY WORKERS ── */}
      {tab==="keyworkers"&&(
        <div style={{display:"grid",gridTemplateColumns:selS?"230px 1fr":"1fr",gap:16}}>
          <div>
            <div style={{fontSize:8,letterSpacing:3,color:C.soft,textTransform:"uppercase",marginBottom:10}}>Select Staff Member</div>
            {staff.filter(s=>s.role==="carer"||s.role==="senior").map(s=>{
              const isS=selS?.id===s.id;
              return <div key={s.id} onClick={()=>{setSelS(s);setKwOk(false);}}
                style={{background:isS?C.border:C.card,border:`1px solid ${isS?C.gold:C.border}`,borderRadius:8,padding:"11px 13px",marginBottom:6,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{if(!isS)e.currentTarget.style.borderColor=C.gold+"60";}} onMouseLeave={e=>{if(!isS)e.currentTarget.style.borderColor=C.border;}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`1.5px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold",color:ROLES[s.role].color,flexShrink:0}}>{s.initials||s.name[0]}</div>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:"bold",color:isS?C.gold:C.text}}>{s.name}</div><div style={{fontSize:9,color:ROLES[s.role].color}}>{ROLES[s.role].label}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:"bold",color:isS?C.gold:C.soft}}>{(s.keyWorkers||[]).length}</div><div style={{fontSize:8,color:C.muted}}>assigned</div></div>
                </div>
              </div>;
            })}
            <div style={{marginTop:12,padding:"11px 13px",background:C.gold+"0A",border:`1px solid ${C.gold}20`,borderRadius:7}}>
              <div style={{fontSize:8,letterSpacing:2,color:C.gold,textTransform:"uppercase",marginBottom:4}}>How This Works</div>
              <div style={{fontSize:11,color:C.soft,lineHeight:1.7}}>Each resident has one named key worker as their permanent primary carer. Only managers and compliance officers can assign key workers.</div>
            </div>
          </div>
          {selS?(
            <Box style={{padding:20,animation:"fadeIn 0.25s ease"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:ROLES[selS.role].color+"20",border:`2px solid ${ROLES[selS.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:"bold",color:ROLES[selS.role].color,flexShrink:0}}>{selS.initials||selS.name[0]}</div>
                  <div><div style={{fontSize:15,fontWeight:"bold"}}>{selS.name}</div><div style={{fontSize:10,color:ROLES[selS.role].color}}>{ROLES[selS.role].label}</div></div>
                </div>
                <button onClick={()=>setKwOk(true)} style={{padding:"7px 16px",background:kwOk?C.eff+"20":C.gold,color:kwOk?C.eff:"#0D1825",border:`1px solid ${kwOk?C.eff:C.gold}`,borderRadius:5,cursor:"pointer",fontWeight:"bold",fontSize:11,fontFamily:"inherit",transition:"all 0.2s"}}>{kwOk?"✓ Saved":"Save Assignments"}</button>
              </div>
              <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:11}}>Assign as Key Worker — Click to Toggle</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {SEED_RESIDENTS.map(r=>{
                  const curKW=kwOf(r.id);
                  const assigned=(staff.find(s=>s.id===selS.id)?.keyWorkers||[]).includes(r.id);
                  const takenByOther=curKW&&curKW.id!==selS.id;
                  return <div key={r.id} onClick={()=>toggleKW(selS.id,r.id)}
                    style={{background:assigned?C.gold+"10":C.bg,border:`1.5px solid ${assigned?C.gold:takenByOther?C.mod+"40":C.border}`,borderRadius:7,padding:"12px 13px",cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start",transition:"all 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=assigned?C.gold:takenByOther?C.mod+"40":C.border}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:12,fontWeight:"bold",color:assigned?C.gold:C.text}}>{r.name}</span>{assigned&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:7,background:C.gold+"25",color:C.gold}}>♥ KW</span>}</div>
                      <div style={{fontSize:10,color:C.soft}}>Room {r.room} · Age {r.age}</div>
                      {takenByOther&&!assigned&&<div style={{fontSize:9,color:C.mod,marginTop:2}}>KW: {curKW.name.split(" ")[0]}</div>}
                    </div>
                    <div style={{width:17,height:17,borderRadius:"50%",border:`2px solid ${assigned?C.gold:C.muted}`,background:assigned?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>{assigned&&<span style={{fontSize:8,color:"#0D1825",fontWeight:"bold"}}>✓</span>}</div>
                  </div>;
                })}
              </div>
              <div style={{padding:"12px 14px",background:C.high+"08",border:`1px solid ${C.high}20`,borderRadius:7}}>
                <div style={{fontSize:8,letterSpacing:2,color:C.high,textTransform:"uppercase",marginBottom:4}}>⚠ Safeguarding — Emergency Access Removal</div>
                <div style={{fontSize:11,color:C.soft,lineHeight:1.6,marginBottom:8}}>If a concern is raised about this staff member, remove all resident access instantly.</div>
                <button onClick={()=>{setStaff(p=>p.map(s=>s.id===selS.id?{...s,keyWorkers:[]}:s));setKwOk(false);}} style={{padding:"6px 13px",background:"none",border:`1px solid ${C.high}40`,color:C.high,borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>Remove All Access for {selS.name.split(" ")[0]}</button>
              </div>
            </Box>
          ):<Box style={{padding:38,textAlign:"center",border:`1px dashed ${C.gold}40`}}><div style={{fontSize:28,marginBottom:10}}>♥</div><div style={{fontSize:12,fontWeight:"bold",marginBottom:5}}>Key Worker Assignment</div><div style={{fontSize:11,color:C.soft,lineHeight:1.8}}>Select a staff member on the left to assign them as key worker for specific residents.</div></Box>}
        </div>
      )}

      {/* ── SHIFTS ── */}
      {tab==="shifts"&&(
        <div>
          {bld&&(
            <Box style={{padding:20,marginBottom:16,border:`1px solid ${C.gold}40`}}>
              <div style={{fontSize:8,letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:14}}>Build New Shift</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:6}}>Date</div><input type="date" value={ns.date} onChange={e=>setNs(n=>({...n,date:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/></div>
                <div><div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:6}}>Shift Type</div><div style={{display:"flex",gap:7}}>{["morning","afternoon","night"].map(s=><button key={s} onClick={()=>setNs(n=>({...n,shift:s}))} style={{flex:1,padding:"8px 5px",borderRadius:5,border:`1px solid ${ns.shift===s?SC[s]:C.border}`,background:ns.shift===s?SC[s]+"20":"transparent",color:ns.shift===s?SC[s]:C.soft,cursor:"pointer",fontSize:10,fontFamily:"inherit",textTransform:"capitalize"}}>{SI[s]} {s}</button>)}</div></div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:7}}>Add Staff</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {staff.filter(s=>s.active&&(s.role==="carer"||s.role==="senior")).map(s=>{const on=ns.assignments.find(a=>a.staffId===s.id);return <button key={s.id} onClick={()=>on?remSt(s.id):addSt(s.id)} style={{padding:"5px 12px",borderRadius:14,border:`1px solid ${on?ROLES[s.role].color:C.border}`,background:on?ROLES[s.role].color+"20":"transparent",color:on?ROLES[s.role].color:C.soft,cursor:"pointer",fontSize:10,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:9,fontWeight:"bold"}}>{s.initials||s.name[0]}</span>{s.name.split(" ")[0]} {on&&"✓"}</button>;})}
                </div>
              </div>
              {ns.assignments.length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:8,letterSpacing:2,color:C.soft,textTransform:"uppercase",marginBottom:9}}>Assign Residents</div>
                  {ns.assignments.map(a=>{const s=staff.find(s=>s.id===a.staffId);if(!s)return null;return(
                    <div key={a.staffId} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:12,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`1.5px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:"bold",color:ROLES[s.role].color,flexShrink:0}}>{s.initials||s.name[0]}</div>
                        <span style={{fontSize:11,fontWeight:"bold"}}>{s.name}</span><span style={{fontSize:10,color:C.soft}}>{a.residentIds.length} assigned</span>
                        <button onClick={()=>remSt(s.id)} style={{marginLeft:"auto",background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15,padding:"0 3px"}}>×</button>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {SEED_RESIDENTS.map(r=>{const sel=a.residentIds.includes(r.id);return <div key={r.id} onClick={()=>togRes(s.id,r.id)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${sel?ROLES[s.role].color:C.border}`,background:sel?ROLES[s.role].color+"18":"transparent",color:sel?ROLES[s.role].color:C.soft,cursor:"pointer",fontSize:10,transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=ROLES[s.role].color} onMouseLeave={e=>e.currentTarget.style.borderColor=sel?ROLES[s.role].color:C.border}>{r.name.split(" ")[0]} {sel&&"✓"}</div>;})}
                      </div>
                    </div>
                  );})}
                </div>
              )}
              {ns.assignments.length>0 && <CoverageCheck assignments={ns.assignments}/>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveSh} disabled={!ns.assignments.length} style={{padding:"9px 20px",background:C.gold,color:"#0D1825",border:"none",borderRadius:5,cursor:"pointer",fontWeight:"bold",fontSize:11,fontFamily:"inherit",opacity:!ns.assignments.length?0.5:1}}>→ Save Shift</button>
                <button onClick={()=>{setBld(false);setNs({date:TD,shift:"morning",assignments:[]});}} style={{padding:"8px 14px",background:"none",border:`1px solid ${C.border}`,color:C.soft,borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Cancel</button>
              </div>
            </Box>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...shifts].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(sh=>{
              const isOpen=selSh===sh.id; const unc=uncovered(sh);
              const shStaff=sh.assignments.map(a=>staff.find(s=>s.id===a.staffId)).filter(Boolean);
              const covN=new Set(sh.assignments.flatMap(a=>a.residentIds)).size;
              return(
                <Box key={sh.id} style={{overflow:"hidden",border:`1px solid ${unc.length>0?C.high+"40":C.border}`}}>
                  <div onClick={()=>setSelSh(isOpen?null:sh.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"13px 17px",cursor:"pointer"}}>
                    <div style={{width:34,height:34,borderRadius:7,background:SC[sh.shift]+"20",border:`1px solid ${SC[sh.shift]}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{SI[sh.shift]}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:"bold"}}>{fmtD(sh.date)}</span>
                        <span style={{fontSize:11,color:SC[sh.shift],fontWeight:"bold"}}>{sh.label}</span>
                        <span style={{fontSize:10,color:C.soft}}>{sh.time}</span>
                        <span style={{fontSize:8,fontWeight:"bold",padding:"1px 7px",borderRadius:8,background:(sh.status==="active"?C.eff:sh.status==="upcoming"?C.mod:C.muted)+"20",color:sh.status==="active"?C.eff:sh.status==="upcoming"?C.mod:C.muted}}>{sh.status.toUpperCase()}</span>
                      </div>
                      <div style={{display:"flex",gap:7,alignItems:"center"}}>
                        <span style={{fontSize:10,color:C.soft}}>{shStaff.length} staff</span>
                        <span style={{fontSize:9,color:C.muted}}>·</span>
                        <span style={{fontSize:10,color:C.soft}}>{covN}/{SEED_RESIDENTS.length} residents</span>
                        {unc.length>0&&<span style={{fontSize:9,color:C.high,fontWeight:"bold"}}>⚠ {unc.length} uncovered</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:-4,marginRight:7}}>{shStaff.slice(0,4).map(s=><div key={s.id} style={{width:24,height:24,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`1.5px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:"bold",color:ROLES[s.role].color,marginLeft:-4}}>{s.initials||s.name[0]}</div>)}</div>
                    <div style={{fontSize:10,color:C.muted}}>{isOpen?"↑":"↓"}</div>
                  </div>
                  {isOpen&&(
                    <div style={{borderTop:`1px solid ${C.border}`,padding:"13px 17px",animation:"fadeIn 0.2s ease"}}>
                      {sh.assignments.map(a=>{const s=staff.find(s=>s.id===a.staffId);if(!s)return null;return(
                        <div key={a.staffId} style={{display:"flex",gap:11,padding:"9px 13px",background:C.bg,borderRadius:6,marginBottom:6,alignItems:"flex-start"}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:ROLES[s.role].color+"20",border:`1.5px solid ${ROLES[s.role].color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:"bold",color:ROLES[s.role].color,flexShrink:0}}>{s.initials||s.name[0]}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:"bold",marginBottom:5}}>{s.name} <span style={{fontSize:8,color:ROLES[s.role].color}}>{ROLES[s.role].badge}</span></div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{a.residentIds.map(id=>{const r=SEED_RESIDENTS.find(r=>r.id===id);const isKW=(s.keyWorkers||[]).includes(id);return r?<span key={id} style={{fontSize:9,padding:"2px 7px",borderRadius:5,background:isKW?C.gold+"15":C.card,border:`1px solid ${isKW?C.gold+"40":C.border}`,color:isKW?C.gold:C.soft}}>{r.name.split(" ")[0]}{isKW&&" ♥"}</span>:null;})}</div>
                          </div>
                          <button onClick={()=>remFromSh(sh.id,a.staffId)} style={{padding:"3px 9px",background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>Remove</button>
                        </div>
                      );})}
                      {unc.length>0&&<div style={{marginTop:7,padding:"7px 11px",background:C.high+"10",border:`1px solid ${C.high}30`,borderRadius:5,fontSize:11,color:C.high}}>⚠ Not covered: {unc.map(r=>r.name).join(", ")}</div>}
                    </div>
                  )}
                </Box>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COVERAGE CHECK — standalone component to avoid IIFE in JSX
// ─────────────────────────────────────────────────────────────────────────────
function CoverageCheck({ assignments }) {
  const covered = new Set(assignments.flatMap(a => a.residentIds));
  const unc = SEED_RESIDENTS.filter(r => !covered.has(r.id));
  if (unc.length > 0) {
    return (
      <div style={{marginBottom:11,padding:"8px 12px",background:C.high+"10",border:`1px solid ${C.high}30`,borderRadius:5,fontSize:11,color:C.high}}>
        ⚠ Not yet covered: {unc.map(r => r.name.split(" ")[0]).join(", ")}
      </div>
    );
  }
  return (
    <div style={{marginBottom:11,padding:"8px 12px",background:C.eff+"10",border:`1px solid ${C.eff}30`,borderRadius:5,fontSize:11,color:C.eff}}>
      ✓ All {SEED_RESIDENTS.length} residents covered
    </div>
  );
}
