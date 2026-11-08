import { useNavigate } from 'react-router-dom';
import { first, WDS } from '../lib/format';
import { dayState, freeDays } from '../lib/world';
import { useStore, useWorld } from '../store';

const LABEL = {free: 'livre', busy: 'ocupado', off: 'folga', past: 'passado'};

export default function Agenda() {
  const w = useWorld(), nav = useNavigate(), toggleDay = useStore(s => s.toggleDay), p = w.me;
  const free = freeDays(w, p);
  const legend = (cls: string, t: string) => <span style={{display: 'flex', gap: 6, alignItems: 'center'}}><span className={'day ' + cls} style={{minHeight: 14, width: 14, padding: 0, borderRadius: 4}} />{t}</span>;

  return <>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, alignItems: 'flex-end'}}>
      <span><h1 style={{fontSize: 28}}>Agenda de {first(p.name)}</h1><p className="muted small">Novembro de 2026 · toque num dia para alternar entre livre e folga</p></span>
      <span className="chip o" style={{fontSize: 14, padding: '8px 14px'}}>{free.length} dias livres</span>
    </div>
    <div className="row">
      <section className="main-col card">
        <div className="days" style={{marginBottom: 6}}>{WDS.map(d => <span key={d} className="small muted" style={{textAlign: 'center', fontWeight: 700}}>{d}</span>)}</div>
        <div className="days">
          {Array.from({length: 30}, (_, i) => i + 1).map(d => {
            const st = dayState(w, p, d), job = w.orders.find(o => o.proId === p.id && o.day === d && ['accepted', 'paid'].includes(o.status));
            const can = st === 'free' || st === 'off';
            return (
              <button key={d} className={'day ' + st} disabled={!can} style={{minHeight: 64}} aria-label={`${d} de novembro, ${LABEL[st]}`}
                onClick={() => job ? nav('/pedidos/' + job.id) : toggleDay(d)}>
                {d}<small>{st === 'free' ? 'Livre' : st === 'busy' ? (job ? 'Pedido' : 'Ocupado') : st === 'off' ? 'Folga' : ''}</small>
              </button>
            );
          })}
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14, fontSize: 13}}>{legend('free', 'Livre')}{legend('busy', 'Ocupado')}{legend('off', 'Folga')}</div>
      </section>
      <aside className="side-col">
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <b>Tudo conectado</b>
          <p className="small muted" style={{lineHeight: 1.55}}>Os dias livres aparecem no seu perfil para os clientes. Quando um pedido é aceito, o dia fica ocupado sozinho.</p>
          <button className="btn n w" onClick={() => nav('/perfil')}>Ver meu perfil</button>
        </div>
      </aside>
    </div>
  </>;
}
