import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { BackBtn } from '../components/common';
import { CATS, TODAY } from '../data/seed';
import { WDS, wd } from '../lib/format';
import type { CatKey } from '../lib/types';
import { toast, useStore } from '../store';

const BUDGETS: [number, string][] = [[0, 'Prefiro receber propostas'], [150, 'Até R$ 150'], [250, 'Até R$ 250'], [400, 'Até R$ 400'], [1000, 'Até R$ 1.000'], [2500, 'Até R$ 2.500']];

export default function Publish() {
  const [params] = useSearchParams(), nav = useNavigate();
  const sfText = useStore(s => s.sf.text), publishJob = useStore(s => s.publishJob);
  const cat = params.get('cat') as CatKey | null;
  const [title, setTitle] = useState(cat ? CATS[cat]?.label ?? '' : '');
  const [desc, setDesc] = useState(sfText);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  if (!cat || !CATS[cat]) return <Navigate to="/buscar" replace />;
  const days = Array.from({length: 10}, (_, i) => TODAY + i);
  const ok = day && time && title.trim();

  const submit = () => {
    if (!ok) return;
    const n = publishJob({cat, title: title.trim(), desc: desc.trim(), budget, day: day!, time: time!});
    toast(`Pedido publicado. ${n} profissionais já enviaram propostas.`);
    nav('/pedidos');
  };

  return <>
    <BackBtn />
    <div className="row">
      <section className="main-col card" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <h1 style={{fontSize: 26}}>Publicar pedido</h1>
        <div><span className="lbl">Categoria</span><span className="chip d">{CATS[cat].label}</span></div>
        <div><label className="lbl" htmlFor="pubTitle">Título do pedido</label><input type="text" id="pubTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Instalar chuveiro novo" /></div>
        <div><label className="lbl" htmlFor="pubDesc">Descrição</label><textarea id="pubDesc" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Conte os detalhes do serviço" /></div>
        <div><span className="lbl">Dia</span>
          <div className="days">{days.map(d => {
            const off = wd(d) === 0;
            return <button key={d} className={`day ${off ? 'off' : 'free'} ${day === d ? 'sel' : ''}`} disabled={off} onClick={() => setDay(d)}><small>{WDS[wd(d)]}</small>{d}</button>;
          })}</div>
        </div>
        <div><span className="lbl">Horário</span>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>{['8h', '10h', '14h', '16h', '19h'].map(t => <button key={t} className="tog" aria-pressed={time === t} onClick={() => setTime(t)}>{t}</button>)}</div>
        </div>
        <div><label className="lbl" htmlFor="pubBud">Quanto pretende pagar (opcional)</label>
          <select id="pubBud" value={budget} onChange={e => setBudget(+e.target.value)} style={{minHeight: 44, borderRadius: 12, border: '1px solid var(--line2)', padding: '0 10px', background: '#fff'}}>
            {BUDGETS.map(b => <option key={b[0]} value={b[0]}>{b[1]}</option>)}
          </select>
        </div>
        <button className="btn" disabled={!ok} onClick={submit}>Publicar para profissionais de {CATS[cat].label.toLowerCase()}</button>
      </section>
      <aside className="side-col">
        <div className="dark" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <b>Como funciona</b>
          <p className="small" style={{color: '#E1E7F0', lineHeight: 1.55}}>Seu pedido aparece em “Oportunidades” para profissionais da área, ordenado por compatibilidade. Você recebe as propostas, compara preço, nota e distância e escolhe uma. Só paga depois de escolher, com pagamento protegido.</p>
        </div>
      </aside>
    </div>
  </>;
}
