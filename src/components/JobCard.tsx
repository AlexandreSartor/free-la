import { Link, useNavigate } from 'react-router-dom';
import { CATS } from '../data/seed';
import { ago, brl, fmtDay, nf } from '../lib/format';
import type { Job, Match, Person } from '../lib/types';
import { cRate, cTxt, jobDist, why } from '../lib/world';
import { toast, useStore, useWorld } from '../store';
import { Avatar } from './Avatar';
import { TrustMini } from './common';

export default function JobCard({j, m, p}: { j: Job; m: Match; p: Person }) {
  const w = useWorld(), nav = useNavigate(), simClientAccept = useStore(s => s.simClientAccept);
  const cl = w.byId[j.clientId], mine = j.proposals.find(x => x.proId === p.id), jd = jobDist(p, j);
  return (
    <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'}}>
        <Avatar u={cl} size={42} />
        <span style={{flex: '1 1 180px', display: 'flex', flexDirection: 'column'}}>
          <Link className="lnk" style={{fontWeight: 700, fontSize: 14, color: 'var(--navy)'}} to={'/perfil/' + cl.id}>{cl.name}</Link>
          <span className="small muted">{cTxt(cl)}{(cRate(cl) || 0) >= 4.8 ? ' · Bom cliente' : ''} · {ago(j.ago)}</span>
          <TrustMini u={cl} />
        </span>
        <span className="pct">{m.pct}% compatível</span>
      </div>
      <h3 style={{fontSize: 18}}>{j.title}</h3>
      {j.desc && <p className="small" style={{color: 'var(--ink2)'}}>{j.desc}</p>}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
        <span className="chip">{CATS[j.cat].label}</span>
        <span className="chip">{jd === 0 ? 'Online' : nf(jd) + ' km · ' + j.hood}</span>
        <span className={'chip ' + (j.urgent ? 'o' : '')}>{j.urgent ? 'Urgente, hoje' : fmtDay(j.day) + ', ' + j.time}</span>
        <span className="chip">{j.budget ? brl(j.budget[0]) + ' a ' + brl(j.budget[1]) : 'Orçamento aberto'}</span>
        <span className="chip">{j.others + j.proposals.length} propostas</span>
      </div>
      <p className="small" style={{color: 'var(--ink2)'}}><b>Por quê:</b> {why(m, 'combinação parcial')}</p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
        {mine ? <>
          <span className="chip o" style={{padding: '10px 14px'}}>Proposta enviada: {brl(mine.price)}</span>
          <button className="btn o" style={{minHeight: 40, fontSize: 13}} onClick={() => { const id = simClientAccept(j.id); toast(cl.name.split(' ')[0] + ' aceitou sua proposta.'); nav('/pedidos/' + id); }}>Simular: cliente aceita</button>
        </> : <button className="btn" style={{minHeight: 42, fontSize: 14}} onClick={() => nav('/trabalhar/oportunidades/' + j.id)}>Enviar proposta</button>}
      </div>
    </div>
  );
}
