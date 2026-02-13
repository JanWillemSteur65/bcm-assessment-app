import React, { useEffect, useState } from 'react';
import { Tile, TextInput, Button, InlineLoading, InlineNotification } from '@carbon/react';
import { api } from '../lib/api.js';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const [cfg, setCfg] = useState({
    DB2_HOST: '',
    DB2_PORT: '50000',
    DB2_DB: 'BCMDB',
    DB2_USER: '',
    DB2_PASSWORD: ''
  });

  const load = async () => {
    const s = await api.get('/api/system/status');
    setStatus(s.data);
    const c = await api.get('/api/system/db-config');
    if (c.data?.exists && c.data?.config) {
      setCfg(prev => ({ ...prev, ...c.data.config, DB2_PASSWORD: '' }));
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await api.post('/api/system/db-config', cfg);
      setNotice({ kind:'success', title:'Saved', subtitle:'Db2 connection saved. The server will retry connecting in the background.' });
      await load();
    } catch (e) {
      setNotice({ kind:'error', title:'Save failed', subtitle: e?.response?.data?.error || 'Unable to save Db2 config' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding:16, maxWidth: 900 }}>
      <h3 style={{ marginTop:0 }}>Settings</h3>

      <Tile style={{ padding:16, marginBottom:16 }}>
        <h4 style={{ marginTop:0 }}>Database status</h4>
        {status ? (
          <>
            <p style={{ margin:0 }}>
              Connected: <b>{String(status.connected)}</b>
            </p>
            {status.lastError ? (
              <p style={{ marginTop:8, opacity:0.85 }}>
                Last error: <code>{status.lastError}</code>
              </p>
            ) : null}
            {status.lastAttemptAt ? (
              <p style={{ marginTop:8, opacity:0.7 }}>
                Last attempt: {status.lastAttemptAt}
              </p>
            ) : null}
          </>
        ) : <InlineLoading description="Loading status..." />}
      </Tile>

      <Tile style={{ padding:16 }}>
        <h4 style={{ marginTop:0 }}>Db2 connection wizard</h4>
        <p style={{ marginTop:0, opacity:0.8 }}>
          In restricted OpenShift clusters, a privileged “demo Db2” pod is not allowed.
          Configure a Db2u Operator instance or an external Db2 service here.
        </p>

        {notice ? (
          <InlineNotification
            kind={notice.kind}
            title={notice.title}
            subtitle={notice.subtitle}
            lowContrast
            onCloseButtonClick={() => setNotice(null)}
          />
        ) : null}

        <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(260px, 1fr))', marginTop:12 }}>
          <TextInput labelText="DB2 Host / Service" value={cfg.DB2_HOST} onChange={(e)=>setCfg({...cfg, DB2_HOST:e.target.value})} />
          <TextInput labelText="DB2 Port" value={cfg.DB2_PORT} onChange={(e)=>setCfg({...cfg, DB2_PORT:e.target.value})} />
          <TextInput labelText="Database name" value={cfg.DB2_DB} onChange={(e)=>setCfg({...cfg, DB2_DB:e.target.value})} />
          <TextInput labelText="User" value={cfg.DB2_USER} onChange={(e)=>setCfg({...cfg, DB2_USER:e.target.value})} />
          <TextInput labelText="Password" type="password" value={cfg.DB2_PASSWORD} onChange={(e)=>setCfg({...cfg, DB2_PASSWORD:e.target.value})} />
        </div>

        <div style={{ marginTop:16, display:'flex', gap:12 }}>
          <Button kind="primary" disabled={saving} onClick={save}>
            {saving ? 'Saving...' : 'Save Db2 connection'}
          </Button>
          <Button kind="secondary" disabled={saving} onClick={load}>Refresh status</Button>
        </div>
      </Tile>
    </div>
  );
}
