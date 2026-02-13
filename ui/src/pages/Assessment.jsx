import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Accordion, AccordionItem, Tile, Dropdown, NumberInput, TextArea, InlineLoading } from '@carbon/react';

const inUseItems = [{id:'Yes',text:'Yes'},{id:'Partial',text:'Partial'},{id:'No',text:'No'}];
const yesNoItems = [{id:'Yes',text:'Yes'},{id:'No',text:'No'}];

export default function Assessment() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [answers, setAnswers] = useState(new Map());

  const load = async () => {
    const t = await api.get('/api/catalog/tree');
    setTree(t.data.domains || []);
    const a = await api.get(`/api/assessments/${id}/answers`);
    const map = new Map();
    for (const r of (a.data.answers || [])) map.set(r.FEATURE_ID || r.feature_id, r);
    setAnswers(map);
  };

  const saveAnswer = async (featureId, patch) => {
    await api.put(`/api/assessments/${id}/answers/${featureId}`, patch);
    await load();
  };

  useEffect(()=>{ load(); }, [id]);

  if (!tree) return <div style={{ padding:16 }}><InlineLoading description="Loading..." /></div>;

  return (
    <div style={{ padding:16 }}>
      <h3 style={{ marginTop:0 }}>Assessment</h3>
      {tree.map(domain => (
        <Tile key={domain.id} style={{ marginBottom:16, padding:16 }}>
          <h4 style={{ marginTop:0 }}>{domain.name}</h4>
          <Accordion>
            {domain.subDomains.map(sd => (
              <AccordionItem key={sd.id} title={sd.name}>
                {sd.capabilities.map(cap => (
                  <div key={cap.id} style={{ marginBottom:16 }}>
                    <h5 style={{ margin:'12px 0' }}>{cap.name}</h5>
                    {cap.features.map(feat => {
                      const a = answers.get(feat.id) || {};
                      return (
                        <Tile key={feat.id} style={{ marginBottom:12, padding:16 }}>
                          <div style={{ fontWeight:600 }}>{feat.name}</div>
                          <div style={{ fontSize:12, opacity:0.75 }}>{feat.bcmId}</div>
                          <p style={{ opacity:0.85 }}>{feat.excerpt}</p>

                          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(3, minmax(220px, 1fr))' }}>
                            <Dropdown
                              id={`inuse-${feat.id}`}
                              label="Using feature"
                              items={inUseItems}
                              itemToString={(it)=>it?.text || ''}
                              selectedItem={a.IN_USE ? {id:a.IN_USE,text:a.IN_USE} : null}
                              onChange={(e)=>saveAnswer(feat.id, { inUse: e.selectedItem?.id || null })}
                            />
                            <NumberInput
                              id={`extent-${feat.id}`}
                              label="Implementation extent (1-5)"
                              min={1}
                              max={5}
                              value={a.EXTENT || 1}
                              onChange={(e, { value })=>saveAnswer(feat.id, { extent: Number(value) })}
                            />
                            <Dropdown
                              id={`evid-${feat.id}`}
                              label="Evidence available"
                              items={yesNoItems}
                              itemToString={(it)=>it?.text || ''}
                              selectedItem={a.EVIDENCE ? {id:a.EVIDENCE,text:a.EVIDENCE} : null}
                              onChange={(e)=>saveAnswer(feat.id, { evidence: e.selectedItem?.id || null })}
                            />
                          </div>

                          <div style={{ marginTop:12 }}>
                            <TextArea
                              labelText="Notes"
                              value={a.NOTES || ''}
                              onChange={(e)=>saveAnswer(feat.id, { notes: e.target.value })}
                            />
                          </div>
                        </Tile>
                      )
                    })}
                  </div>
                ))}
              </AccordionItem>
            ))}
          </Accordion>
        </Tile>
      ))}
    </div>
  );
}
