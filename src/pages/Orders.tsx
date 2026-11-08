import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { OrderRow, TrustMini, Verified } from '../components/common';
import { brl, brlc, clientTotal, fmtDay, km, plural } from '../lib/format';
import { matchJob, rTxt } from '../lib/world';
import { toast, useStore, useWorld } from '../store';

export default function Orders() {
  const w = useWorld(), nav = useNavigate(), acceptProposal = useStore(s => s.acceptProposal);
  const mine = w.orders.filter(o => !o.seed && o.clientId === w.meId).reverse();
  const hist = w.orders.filter(o => o.seed && o.clientId === w.meId).reverse();
  const pubs = w.jobs.filter(j => j.clientId === w.meId && j.status === 'open');

  return <>
    <h1 style={{fontSize: 28}}>Meus pedidos</h1>
    {pubs.map(j => (
      <section key={j.id} className="card" style={{display: 'flex', flexDirection: 'column', gap: 12, border: '2px solid var(--navy)'}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8}}>
          <span>
            <span className="chip o">Pedido publicado</span>
            <h2 style={{fontSize: 20, marginTop: 6}}>{j.title}</h2>
            <span className="small muted">{fmtDay(j.day)}, {j.time}{j.budget ? ' · até ' + brl(j.budget[1]) : ''}</span>
          </span>
          <b>{plural(j.proposals.length, 'proposta', 'propostas')}</b>
        </div>
        {j.proposals.length ? j.proposals.map((pp, i) => {
          const p = w.byId[pp.proId], m = matchJob(w, p, j);
          return (
            <div key={pp.proId} className="pro-item" style={{flexWrap: 'wrap', cursor: 'default'}}>
              <Avatar u={p} size={46} />
              <span style={{flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 3}}>
                <b>{p.name} <Verified p={p} /></b>
                <span className="small muted">{p.role} · {km(p)} · nota {rTxt(p)} · {p.jobs} serviços concluídos</span>
                <TrustMini u={p} />
                <span className="small" style={{color: 'var(--ink2)'}}>“{pp.msg}”</span>
              </span>
              <span style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6}}>
                <b style={{fontSize: 18}}>{brlc(clientTotal(pp.price))}</b>
                <span className="small muted">{brlc(pp.price)} + taxa de proteção</span>
                <span className="pct">{m.pct}% compatível</span>
                <span style={{display: 'flex', gap: 6}}>
                  <button className="btn o" style={{minHeight: 40, fontSize: 13}} onClick={() => nav('/perfil/' + p.id)}>Ver perfil</button>
                  <button className="btn" style={{minHeight: 40, fontSize: 13}} onClick={() => { const id = acceptProposal(j.id, i); toast(`Proposta de ${p.name.split(' ')[0]} aceita. Deu match!`); nav('/pedidos/' + id); }}>Aceitar</button>
                </span>
              </span>
            </div>
          );
        }) : <div className="empty">Aguardando propostas.</div>}
      </section>
    ))}
    {mine.length ? mine.map(o => <OrderRow key={o.id} o={o} />) : (!pubs.length &&
      <div className="empty">Você ainda não fez nenhum pedido.<br /><br /><button className="btn" onClick={() => nav('/')}>Fazer um pedido</button></div>)}
    <h2 style={{fontSize: 18}}>Histórico como contratante</h2>
    {hist.length ? hist.map(o => <OrderRow key={o.id} o={o} />) : <p className="small muted">Nada ainda.</p>}
  </>;
}
