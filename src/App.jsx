import React, { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG & COLORS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CORE APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState([
    { id: 1, resident_name: "Mary Jones", observation: "Morning medication administered.", mood: "Happy", ts: "2026-04-16T08:00:00Z" }
  ]);

  // Handle API Key Setup
  if (!isLoggedIn && !apiKey) {
    return (
      <div style={{ height: "100vh", background: C.bg, color: C.text, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: C.card, padding: 40, borderRadius: 12, border: `1px solid ${C.border}`, width: 350 }}>
          <h2 style={{ color: C.gold, marginBottom: 20 }}>CareIQ Setup</h2>
          <input 
            type="password" 
            placeholder="Enter Gemini API Key..." 
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
      {/* SIDEBAR */}
      <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, padding: 20 }}>
        <h2 style={{ color: C.gold, fontSize: 22, marginBottom: 40 }}>CareIQ <span style={{fontSize:10, opacity:0.5}}>v1.2</span></h2>
        {NAV_ITEMS.map(item => (
          <div 
            key={item.id}
            onClick={() => setView(item.id)}
            style={{ 
              padding: "12px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 8,
              background: view === item.id ? `${C.gold}20` : "transparent",
              color: view === item.id ? C.gold : C.soft,
              fontWeight: view === item.id ? "bold" : "normal",
              transition: "0.2s"
            }}
          >
            {item.icon} &nbsp; {item.label}
          </div>
        ))}
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          style={{ marginTop: 40, background: "none", border: "none", color: C.high, cursor: "pointer", fontSize: 12 }}
        >
          Reset App
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: 40, overflowY: "auto" }}>
        {view === "dashboard" && <Dashboard notes={notes} />}
        {view === "notes" && <NotesManager apiKey={apiKey} onAdd={(n) => setNotes([n, ...notes])} />}
        {view === "residents" && <div style={{ color: C.soft }}>Resident database coming soon...</div>}
        {view === "evidence" && <div style={{ color: C.soft }}>CQC Compliance logs coming soon...</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ notes }) {
  return (
    <div>
      <h1 style={{ marginBottom: 30 }}>Service Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.soft, fontSize: 12 }}>Active Residents</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>12</div>
        </div>
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.soft, fontSize: 12 }}>Daily Notes</div>
          <div style={{ fontSize: 28, fontWeight: "bold" }}>{notes.length}</div>
        </div>
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.soft, fontSize: 12 }}>Compliance Score</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: C.eff }}>98%</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES COMPONENT (With AI)
// ─────────────────────────────────────────────────────────────────────────────
function NotesManager({ apiKey, onAdd }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  const runAI = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Convert this care note to JSON. Fields: resident_name, observation, mood. Input: ${input}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      setAiPreview(parsed);
    } catch (err) {
      console.error(err);
      alert("AI Failed. Using Manual Entry.");
      setAiPreview({ resident_name: "Unknown", observation: input, mood: "Neutral" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 20 }}>Clinical Logging</h2>
      <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
        <textarea 
          placeholder="E.g. Mary was very happy today and ate all her lunch."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", height: 100, background: "transparent", border: "none", color: "white", outline: "none", resize: "none" }}
        />
        <button 
          onClick={runAI} 
          disabled={loading}
          style={{ width: "100%", padding: 12, background: C.gold, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Analyzing..." : "Analyze Entry"}
        </button>
      </div>

      {aiPreview && (
        <div style={{ marginTop: 20, background: `${C.eff}10`, padding: 20, borderRadius: 12, border: `1px solid ${C.eff}` }}>
          <h4 style={{ color: C.eff }}>AI Suggestion:</h4>
          <p><strong>Resident:</strong> {aiPreview.resident_name}</p>
          <p><strong>Note:</strong> {aiPreview.observation}</p>
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
