import { useState, useEffect } from 'react';
import './App.css';

// DEPLOYMENT KE BAAD ISKO CHANGE KARNA
const API_URL = "http://localhost:4000/api/data"; 

function App() {
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);
  const [requestsLeft, setRequestsLeft] = useState(5);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); 

  // --- 🔥 AUTO-RESET LOGIC ---
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      // Timer chal raha hai (59, 58, 57...)
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } 
    else if (cooldown === 0 && status === 429) {
      // MAGIC: Jab Timer 0 hua, agar hum Blocked (429) the -> TOH RESET KAR DO
      setRequestsLeft(5); 
      setStatus(null);
      setResponse({ message: "✅ System Cooldown Complete. Requests restored!" });
    }
    return () => clearTimeout(timer);
  }, [cooldown, status]);


  const testApi = async () => {
    // Agar cooldown chal raha hai, toh click mat hone do
    if (cooldown > 0) return; 

    setLoading(true);
    setResponse(null); 
    
    // Fake delay animation ke liye
    await new Promise(r => setTimeout(r, 400)); 

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      setStatus(res.status);
      setResponse(data);
      
      if (res.status === 429) {
        // --- BLOCKED HAI ---
        setRequestsLeft(0);
        // Backend se time lo, aur +1 second safety buffer add karo
        const waitTime = (data.retryIn || 60) + 1;
        setCooldown(waitTime); 
      } else {
        // --- SUCCESS HAI ---
        // Agar frontend 0 par tha par backend ne Success diya (Sync Fix)
        if (requestsLeft === 0) {
           setRequestsLeft(4); 
        } else {
           setRequestsLeft(prev => prev > 0 ? prev - 1 : 0);
        }
      }
      
    } catch (err) {
      console.error(err);
      setStatus(500);
      setResponse({ error: "Backend connect nahi ho raha hai!" });
    }
    setLoading(false);
  };

  const progressWidth = (requestsLeft / 5) * 100;
  const isBlocked = requestsLeft === 0;

  return (
    <div className="container">
      
      {/* 1. HERO */}
      <section className="hero">
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
        <h1>Rate Limit API</h1>
        <p className="subtitle">Backend Protection & Abuse Prevention Demo</p>
        <button className="btn-glow" onClick={() => document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' })}>
          Test Live API
        </button>
      </section>

      {/* 2. WHY */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Why use this?</h2>
        <div className="grid-cards">
          <div className="glass-card">
            <span className="icon-box">🛡️</span>
            <h3>DDoS Protection</h3>
            <p style={{color: '#aaa'}}>Blocks malicious bots from spamming your server.</p>
          </div>
          <div className="glass-card">
            <span className="icon-box">⚡</span>
            <h3>Fair Usage</h3>
            <p style={{color: '#aaa'}}>Ensures every user gets equal resources.</p>
          </div>
        </div>
      </section>

      {/* 3. TERMINAL (MAIN UI) */}
      <section id="terminal">
        <div className="terminal-wrapper">
          <div className="terminal-header">
            <div className="dot red"></div><div className="dot yellow"></div><div className="dot green"></div>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.8rem' }}>bash — api-test</span>
          </div>

          <div className="terminal-body">
            
            {/* STATUS BAR */}
            <div className="status-bar">
              <div>
                {cooldown > 0 ? (
                   <strong style={{ color: '#ffbd2e', animation: 'pulse-red 1s infinite' }}>
                     ⚠️ COOLDOWN: {cooldown}s
                   </strong>
                ) : (
                   <strong style={{ color: isBlocked ? '#ff4d4d' : '#00dfd8' }}>
                     {isBlocked ? 'SYSTEM LOCKED 🔒' : 'SYSTEM ACTIVE 🟢'}
                   </strong>
                )}
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Limit: 5 Requests / Min</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Remaining: {requestsLeft}</div>
                <div className="progress-container">
                  <div className={`progress-fill ${isBlocked ? 'danger' : ''}`} style={{ width: `${progressWidth}%` }}></div>
                </div>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#00dfd8' }}>➜  ~</span>
              <button 
                className="btn-glow" 
                style={{ 
                  padding: '0.8rem 2rem', 
                  fontSize: '0.9rem',
                  opacity: cooldown > 0 ? 0.5 : 1, 
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                }}
                onClick={testApi} 
                disabled={loading || cooldown > 0} 
              >
                {cooldown > 0 ? `Wait ${cooldown}s` : (loading ? 'Sending...' : 'curl GET /api/data')}
              </button>
            </div>

            {/* OUTPUT */}
            <div className={`code-output ${status === 429 ? 'error' : ''}`}>
              {!response && <span style={{ opacity: 0.5 }}>// Waiting for request...</span>}
              {response && JSON.stringify(response, null, 2)}
            </div>

          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
        <p>Built for Developers • 2026</p>
      </footer>
    </div>
  );
}

export default App;