import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BackBtn, DayTime } from '../components/common';
import OfferForm from '../components/OfferForm';
import { brl, first, fmtDay } from '../lib/format';
import { cTxt } from '../lib/world';
import { toast, useStore, useWorld } from '../store';

export default function Quote() {
  const {id} = useParams(), w = useWorld(), nav = useNavigate(), acceptQuote = useStore(s => s.acceptQuote);
  const o = w.orders.find(x => x.id === id);
  if (!o || o.proId !== w.meId) return <Navigate to="/trabalhar/pedidos" replace />;
  if (o.status !== 'sent') return <Navigate to={'/pedidos/' + o.id} replace />;
  const cl = w.byId[o.clientId], p = w.me;

  return <>
    <BackBtn label="Voltar ao pedido" to={'/pedidos/' + o.id} />
    <OfferForm
      cat={o.cat} initialPrice={p.price} m={o.match} submitLabel="Aceitar e enviar orçamento"
      message={price => `Oi, ${first(cl.name)}! Vi seu pedido e posso atender ${fmtDay(o.day!)} às ${o.time}. O valor fica ${brl(price)}, com tudo incluso. Qualquer dúvida, é só chamar por aqui!`}
      header={
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <span className="small muted">Pedido de {cl.name} · {cTxt(cl)}</span>
          <h1 style={{fontSize: 24}}>{o.title}</h1>
          <span className="small muted"><DayTime o={o} /></span>
          {o.desc && <p style={{color: 'var(--ink2)'}}>“{o.desc}”</p>}
        </div>
      }
      onSubmit={(price, msg) => { acceptQuote(o.id, price, msg); toast('Orçamento enviado. Deu match!'); nav('/pedidos/' + o.id); }}
    />
  </>;
}
