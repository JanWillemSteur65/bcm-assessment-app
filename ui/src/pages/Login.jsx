import React, { useState } from 'react';
import { Button, TextInput, Tile } from '@carbon/react';
import { api } from '../lib/api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState(null);

  const submit = async () => {
    setErr(null);
    try {
      const r = await api.post('/api/auth/login', { email, password });
      onLogin(r.data.token);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'stretch' }}>
      <div style={{ flex:'0 0 46%', background:'#0f0f0f', color:'#fff', padding:32 }}>
        <img src="/assets/login-hero.png" alt="Login Hero" style={{ width:'100%', borderRadius:12 }} />
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
        <Tile style={{ width:420, padding:24 }}>
          <h2 style={{ marginTop:0 }}>Sign in</h2>
          <p style={{ marginTop:0, opacity:0.8 }}>Use your organisation credentials.</p>
          <TextInput labelText="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <div style={{ height:16 }} />
          <TextInput labelText="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {err ? <p style={{ color:'#da1e28' }}>{err}</p> : null}
          <div style={{ height:16 }} />
          <Button kind="primary" onClick={submit} style={{ width:'100%' }}>Login</Button>
        </Tile>
      </div>
    </div>
  );
}
