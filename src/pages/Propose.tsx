import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BackBtn } from '../components/common';
import OfferForm from '../components/OfferForm';
import { brl, first, fmtDay, nf } from '../lib/format';
import { cTxt, jobDist, matchJob } from '../lib/world';
import { toast, useStore, useWorld } from '../store';

export default function Propose() {
  const {id} = useParams(), w = useWorld(), nav = useNavigate(), sendProposal = useStore(s => s.sendProposal);
  const j = w.jobs.find(x => x.id === id);
  if (!j || j.status !== 'open') return <Navigate to="/trabalhar/oportunidades" replace />;
  const p = w.me, cl = w.byId[j.clientId], m = matchJob(w, p, j), jd = jobDist(p, j);
  const def = j.budget ? Math.min(Math.max(p.price, j.budget[0]), j.budget[1]) : p.price;
  const when = j.urgent ? 'hoje' : fmtDay(j.day);

  return <>
    <BackBtn label="Oportunidades" to="/trabalhar/oportunidades" />
    <OfferForm
      cat={j.cat} initialPrice={def} m={m} budget={j.budget} submitLabel="Enviar proposta"
      message={price => `Oi, ${first(cl.name)}! Vi seu pedido e posso atender ${when}${j.time && j.time !== 'a combinar' && !j.urgent ? ' às ' + j.time : ''}. O valor fica ${brl(price)}, com tudo incluso.${p.count ? ` Tenho nota ${nf(p.rating)} e ${p.jobs} serviços concluídos aqui.` : ''}`}
      header={
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <span className="small muted">{cl.name} · {cTxt(cl)}</span>
          <h1 style={{fontSize: 24}}>{j.title}</h1>
          <span className="small muted">{j.urgent ? 'Urgente, hoje' : fmtDay(j.day) + ', ' + j.time} · {jd === 0 ? 'online' : nf(jd) + ' km'}</span>
          {j.desc && <p style={{color: 'var(--ink2)'}}>“{j.desc}”</p>}
        </div>
      }
      onSubmit={(price, msg) => { sendProposal(j.id, price, msg); toast('Proposta enviada para ' + first(cl.name) + '.'); nav('/trabalhar/oportunidades'); }}
    />
  </>;
}
