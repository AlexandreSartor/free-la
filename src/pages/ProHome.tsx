import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { DayTime, OrderRow, TrustMini } from '../components/common';
import { Icon } from '../components/Icon';
import JobCard from '../components/JobCard';
import { CATS } from '../data/seed';
import { brl, first, plural } from '../lib/format';
import { cTxt, earnings, freeDays, matchJob, position, rTxt } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function ProHome() {
  const w = useWorld(), nav = useNavigate(), toggleNow = useStore(s => s.toggleNow), openTour = useStore(s => s.openTour);
  const p = w.me;
  const novos = w.orders.filter(o => o.proId === p.id && o.status === 'sent');
  const andamento = w.orders.filter(o => o.proId === p.id && ['accepted', 'paid', 'done'].includes(o.status));
  const free = freeDays(w, p), pos = position(w, p);
  const opps = w.jobs.filter(j => j.status === 'open' && j.cat === p.cat && j.clientId !== w.meId).map(j => ({j, m: matchJob(w, p, j)})).sort((a, b) => b.m.pct - a.m.pct).slice(0, 2);

  return <>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center'}}>
      <span style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10}}>
        <h1 style={{fontSize: 30}}>Olá, {first(p.name)}</h1>
        <button className="tog" onClick={openTour} style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><Icon n="info" s={16} />Como funciona</button>
      </span>
      <button className="card" onClick={toggleNow} aria-pressed={p.now}
        style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', ...(p.now ? {background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)'} : {})}}>
        <span style={{display: 'flex', flexDirection: 'column', textAlign: 'left'}}>
          <b>{p.now ? 'Disponível agora' : 'Indisponível'}</b>
          <span className="small" style={{opacity: .8}}>{p.now ? 'Você aparece nos pedidos urgentes' : 'Toque para receber pedidos urgentes'}</span>
        </span>
        <span style={{width: 54, height: 30, borderRadius: 999, padding: 3, display: 'flex', justifyContent: p.now ? 'flex-end' : 'flex-start', background: p.now ? 'var(--or)' : 'var(--line2)'}}>
          <span style={{width: 24, height: 24, borderRadius: 999, background: '#fff'}} />
        </span>
      </button>
    </div>
    <div className="grid" style={{'--min': '150px'} as CSSProperties}>
      <div className="statl"><b>{brl(earnings(w, p))}</b><span>ganhos no mês</span></div>
      <div className="statl"><b>{rTxt(p)}</b><span>{plural(p.count, 'avaliação', 'avaliações')} como prestador</span></div>
      <div className="statl"><b>{p.jobs}</b><span>serviços feitos</span></div>
      <button className="statl" onClick={() => nav('/ranking')} style={{textAlign: 'left', background: 'var(--orT)', borderColor: 'var(--orL)'}}>
        <b>{pos ? pos + 'º lugar' : 'Novo'}</b><span>{pos ? 'no ranking de ' + CATS[p.cat].label.toLowerCase() : 'entra no ranking após a 1ª avaliação'}</span>
      </button>
    </div>
    <div className="row">
      <section className="main-col">
        <h2 style={{fontSize: 20}}>Pedidos novos para você</h2>
        {novos.length ? novos.map(o => {
          const cl = w.byId[o.clientId];
          return (
            <div key={o.id} className="pro-item" style={{flexWrap: 'wrap'}}>
              <Avatar u={cl} size={46} />
              <span style={{flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 3}}>
                <b>{o.title}</b><span className="small muted">{cl.name} · {cTxt(cl)} · <DayTime o={o} /></span><TrustMini u={cl} />
              </span>
              {o.match && <span className="pct">{o.match.pct}% compatível</span>}
              <button className="btn" onClick={() => nav('/trabalhar/pedidos/' + o.id + '/orcamento')}>Responder</button>
            </div>
          );
        }) : <div className="empty">Nenhum pedido novo agora.<br />Quando um cliente contratar você, o pedido aparece aqui.</div>}
        {opps.length > 0 && <>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <h2 style={{fontSize: 20}}>Oportunidades abertas na sua área</h2>
            <button className="gx" onClick={() => nav('/trabalhar/oportunidades')}>Ver todas</button>
          </div>
          {opps.map(x => <JobCard key={x.j.id} j={x.j} m={x.m} p={p} />)}
        </>}
        {andamento.length > 0 && <><h2 style={{fontSize: 20}}>Em andamento</h2>{andamento.map(o => <OrderRow key={o.id} o={o} />)}</>}
        <p className="small muted">Ver pedidos, enviar orçamentos e receber pelos serviços é grátis: você recebe 100% do valor combinado.</p>
      </section>
      <aside className="side-col">
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <b>Seu perfil de prestador</b>
          <p className="small muted">{p.role} · a partir de {brl(p.price)} · {plural(p.skills.length, 'habilidade', 'habilidades')} cadastradas.</p>
          <button className="btn n w" onClick={() => nav('/trabalhar/perfil')}>Editar perfil</button>
        </div>
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <b>Agenda</b>
          <p className="small muted">{free.length} dias livres até o fim do mês. Clientes só agendam nesses dias.</p>
          <button className="btn o w" onClick={() => nav('/trabalhar/agenda')}><Icon n="cal" s={18} />Abrir agenda</button>
        </div>
      </aside>
    </div>
  </>;
}
