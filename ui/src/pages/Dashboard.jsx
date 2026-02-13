import React, { useEffect, useState } from 'react';
import { Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TextInput, Tile } from '@carbon/react';
import { api } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [title, setTitle] = useState('New Assessment');
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  const load = async () => {
    const r = await api.get('/api/assessments');
    setItems(r.data.assessments || []);
  };

  useEffect(()=>{ load(); }, []);

  const create = async () => {
    const r = await api.post('/api/assessments', { title });
    await load();
    nav(`/assessment/${r.data.id}`);
  };

  return (
    <div style={{ padding:16 }}>
      <h3 style={{ marginTop:0 }}>Assessments</h3>
      <Tile style={{ padding:16, marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'end' }}>
          <TextInput labelText="Assessment title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Button onClick={create}>Create</Button>
        </div>
      </Tile>

      <DataTable rows={items.map(r=>({ id: r.ID || r.id, title: r.TITLE || r.title, created_at: r.CREATED_AT || r.created_at }))} headers={[
        { key:'title', header:'Title' },
        { key:'created_at', header:'Created' }
      ]}>
        {({ rows, headers, getHeaderProps, getRowProps }) => (
          <Table>
            <TableHead>
              <TableRow>
                {headers.map(h => <TableHeader key={h.key} {...getHeaderProps({ header: h })}>{h.header}</TableHeader>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} {...getRowProps({ row })} onClick={()=>nav(`/assessment/${row.id}`)} style={{ cursor:'pointer' }}>
                  {row.cells.map(cell => <TableCell key={cell.id}>{cell.value}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
}
