import React, { useState, useEffect } from "react";

const C = {
  bg: "#09111E", surface: "#0E1A2B", card: "#132035", border: "#1C2E42",
  gold: "#D4A853", text: "#EAE6DE", soft: "#7A8FA6", eff: "#10B981", high: "#EF4444"
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "notes", label: "Care Notes", icon: "📝" },
  { id: "residents", label: "Residents", icon: "👥" },
  { id: "evidence", label: "CQC Evidence", icon: "🛡️" }
];

export default function App() {
  const [view, setView] = useState("dashboard");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState([
    { id: 1, resident_name: "Mary Jones", observation: "Morning medication administered.", mood: "Happy", ts: new Date().toISOString() }
  ]);

  if (!isLoggedIn && !apiKey) {
    return (
      <div style={{ height: "100vh", background: C.bg, color: C.text, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: C.card, padding: 40, borderRadius: 12, border: `1px solid ${C.border}`, width: 350 }}>
          <h2 style={{ color: C.gold, marginBottom: 20 }}>CareIQ Setup</h2>
          <p style={{fontSize: 12, color: C.soft, marginBottom: 10}}>Enter Gemini API Key:</p>
          <input 
            type="password" 
            placeholder="AIza..." 
            style={{ width: "100%", padding: 12, background: C.bg, border: `1px solid ${C.border}`, color: "white", borderRadius: 8, marginBottom: 15 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                localStorage.setItem("gemini_key", e.target.value);
                setApiKey(e.target.value);
                setIsLoggedIn(true);
              }
            }}
          />
          <button 
            onClick={() => { const val = document.querySelector('input').value; setApiKey(val); localStorage.setItem("gemini_key", val); setIsLoggedIn(true); }}
            style={{ width: "100%", padding: 12, background: C.gold, border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
          >
            Launch System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui" }}>
      <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, padding: 20 }}>
        <h2 style={{ color: C.gold, fontSize: 22, marginBottom: 40 }}>CareIQ <span style={{fontSize:10, opacity:0.5}}>v1.4</span></h2>
        {NAV_ITEMS.map(item => (
          <div 
            key={item.id}
            onClick={() => setView(item.id)}
            style={{ 
              padding: "12px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 8,
              background: view === item.id ? `${C.gold}20` : "transparent",
              color: view === item.id ? C.gold : C.soft,
              fontWeight: view === item.id ? "bold" : "normal",
            }}
          >
            {item.icon} &nbsp; {item.label}
          </div>
        ))}
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: 40, background: "none", border: "none", color: C.high, cursor: "pointer", fontSize: 12 }}>Reset App</button>
      </div>

      <div style={{ flex: 1, padding: 40, overflowY: "auto" }}>
        {view === "dashboard" && <Dashboard notes={notes} />}
        {view === "notes" && <NotesManager apiKey={apiKey} onAdd={(n) => setNotes([n, ...notes])} />}
        {view === "residents" || view === "evidence" ? <div style={{ color: C.soft }}>Feature coming in next update...</div> : null}
      </div>
    </div>
  );
}

function Dashboard({ notes }) {
  return (
    <div>
      <h1 style={{ marginBottom: 30 }}>Service Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <Box label="Active Residents" value="12" />
        <Box label="Daily Notes" value={notes.length} />
        <Box label="Compliance" value="98%" color={C.eff} />
      </div>
    </div>
  );
}

const Box = ({ label, value, color }) => (
  <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
    <div style={{ color: C.soft, fontSize: 12 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: "bold", color: color || C.text }}>{value}</div>
  </div>
);

function NotesManager({ apiKey, onAdd }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  const runAI = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract info from this care note. Return ONLY a raw JSON object with keys: resident_name, observation, and mood. No other text. Input: ${input}` }] }]
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "API Error");
      }

      const data = await res.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Safety check to remove any extra text the AI might send back
      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}') + 1;
      const cleanJson = textResponse.substring(jsonStart, jsonEnd);
      
      setAiPreview(JSON.parse(cleanJson));
    } catch (err) {
      alert(`AI System Message: ${err.message}`);
      setAiPreview({ resident_name: "Manual Entry", observation: input, mood: "Neutral" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 20 }}>Clinical Logging</h2>
      <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
        <textarea 
          placeholder="E.g. John was happy and ate all his breakfast today."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", height: 100, background: "transparent", border: "none", color: "white", outline: "none", resize: "none" }}
        />
        <button onClick={runAI} disabled={loading} style={{ width: "100%", padding: 12, background: C.gold, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "Analyzing..." : "Analyze Entry"}
        </button>
      </div>

      {aiPreview && (
        <div style={{ marginTop: 20, background: `${C.eff}10`, padding: 20, borderRadius: 12, border: `1px solid ${C.eff}` }}>
          <p><strong>Resident:</strong> {aiPreview.resident_name}</p>
          <p><strong>Observation:</strong> {aiPreview.observation}</p>
          <button 
            onClick={() => { onAdd({ ...aiPreview, id: Date.now(), ts: new Date().toISOString() }); setAiPreview(null); setInput(""); }}
            style={{ marginTop: 10, padding: "8px 16px", background: C.eff, color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Confirm & Save
          </button>
        </div>
      )}
    </div>
  );
}
