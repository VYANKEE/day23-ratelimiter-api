import { useState, useEffect } from 'react';
import './App.css';

// RENDER URL UPDATE KARNA MAT BHOOLNA
// Render wala naya URL yahan daal diya hai
const API_URL = "https://day23-ratelimiter-api-1.onrender.com/api/data";

function App() {
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);
  const [requestsLeft, setRequestsLeft] = useState(5);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); 

  // --- 🔥 FIXED TIMER LOGIC (Wahi same logic jo fix kiya tha) ---
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } 
    else if (cooldown === 0 && requestsLeft === 0 && status === 429) {
      setRequestsLeft(5);
      setStatus(null);
      setResponse({ message: "✅ System Cooldown Complete. You can send requests now!" });
    }
    return () => clearTimeout(timer);
  }, [cooldown, requestsLeft, status]);

  const testApi = async () => {
    if (cooldown > 0) return; 

    setLoading(true);
    setResponse(null); 
    await new Promise(r => setTimeout(r, 400)); 

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      setStatus(res.status);
      setResponse(data);
      
      if (res.status === 429) {
        setRequestsLeft(0);
        const safeWaitTime = (data.retryIn || 60) + 1;
        setCooldown(safeWaitTime); 
      } else {
        setRequestsLeft(prev => prev > 0 ? prev - 1 : 0);
      }
      
    } catch (err) {
      console.error(err);
      setStatus(500);
      setResponse({ error: "Backend connect nahi ho raha! (Server start kiya?)" });
    }
    setLoading(false);
  };

  const progressWidth = (requestsLeft / 5) * 100;
  const isBlocked = requestsLeft === 0;

  return (
    <div className="container">
      
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>🚀</div>
        <h1>Rate Limit <br /> API Demo</h1>
        <p className="subtitle">
          Protect your backend from abuse, spam, and overload.
          <br />Test the limits below.
        </p>
        <button 
          className="btn-glow" 
          onClick={() => document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' })}
        >
          Test Live API
        </button>
      </section>

      {/* 2. WHY USE THIS? (Restored) */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Rate Limiting?</h2>
        <div className="grid-cards">
          <div className="glass-card">
            <span className="icon-box">🛡️</span>
            <h3>Security (DDoS)</h3>
            <p style={{ color: '#aaa' }}>Prevents malicious bots from crashing your server by flooding it with millions of requests.</p>
          </div>
          <div className="glass-card">
            <span className="icon-box">⚖️</span>
            <h3>Fairness</h3>
            <p style={{ color: '#aaa' }}>Ensures no single user hogs all the server resources, keeping the app fast for everyone else.</p>
          </div>
          <div className="glass-card">
            <span className="icon-box">💰</span>
            <h3>Cost Control</h3>
            <p style={{ color: '#aaa' }}>API calls cost server money. Rate limiting prevents unexpected huge bills from accidental loops.</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Restored) */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>How It Works</h2>
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#00dfd8' }}>
            <strong>Algorithm: Fixed Window Counter</strong>
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc' }}>
            <li>1. User sends a request to <code>/api/data</code>.</li>
            <li>2. Middleware checks the <strong>IP Address</strong>.</li>
            <li>3. If requests &lt; 5 in last 60s → <strong>Allow</strong> & Increment Count.</li>
            <li>4. If requests &gt;= 5 → <strong>Block</strong> (Return 429 Error).</li>
            <li>5. After 60s window passes → <strong>Reset</strong> Count to 0.</li>
          </ul>
        </div>
      </section>

      {/* 4. TERMINAL UI SECTION */}
      <section id="terminal">
        <div className="terminal-wrapper">
          <div className="terminal-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.8rem' }}>bash — api-test</span>
          </div>

          <div className="terminal-body">
            
            {/* Status Bar */}
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
                
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  {cooldown > 0 ? 'Wait for timer...' : 'Limit: 5 req/min'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Remaining: {requestsLeft}</div>
                <div className="progress-container">
                  <div 
                    className={`progress-fill ${isBlocked ? 'danger' : ''}`} 
                    style={{ width: `${progressWidth}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ color: '#00dfd8' }}>➜  ~</span>
              <button 
                className="btn-glow" 
                style={{ 
                  padding: '0.5rem 1.5rem', 
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

            {/* Output */}
            <div className={`code-output ${status === 429 ? 'error' : ''}`}>
              {!response && <span style={{ opacity: 0.5 }}>// Waiting for request...</span>}
              {response && JSON.stringify(response, null, 2)}
            </div>

          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '3rem', color: '#444', fontSize: '0.9rem' }}>
        <p>DESIGNED FOR DEVS • 2026</p>
      </footer>
    </div>
  );
}

export default App;