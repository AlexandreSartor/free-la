import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CatImg } from '../components/Avatar';
import { STATUS } from '../components/common';
import { Icon } from '../components/Icon';
import { CATS } from '../data/seed';
import { plural } from '../lib/format';
import type { CatKey } from '../lib/types';
import { levels } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function Home() {
  const w = useWorld(), nav = useNavigate(), resetSf = useStore(s => s.resetSf);
  const [q, setQ] = useState('');
  const o = [...w.orders].reverse().find(x => !x.seed && x.clientId === w.meId && x.status !== 'rated'), lv = levels(w, w.meId);
  const search = () => { resetSf({text: q.trim()}); nav('/buscar'); };

  return <>
    <section className="hero">
      <span className="pinrow"><Icon n="pin" s={15} c="#FF8A3D" />{w.me.hood} · Criciúma e região</span>
      <h1 style={{fontSize: 'clamp(28px,5cqi,42px)', lineHeight: 1.05}}>Qual serviço você procura?</h1>
      <form className="sbar hsbar" onSubmit={e => { e.preventDefault(); search(); }}>
        <Icon n="search" s={20} c="#55627A" />
        <label htmlFor="homeQ" className="sr">Qual serviço você procura?</label>
        <input type="text" id="homeQ" value={q} onChange={e => setQ(e.target.value)} placeholder="Busque por serviço ou nome do profissional" autoComplete="off" />
        <button className="btn" type="submit">Buscar</button>
      </form>
    </section>
    <section style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <h2 style={{fontSize: 20}}>Categorias</h2>
      <div className="grid" style={{'--min': '140px'} as React.CSSProperties}>
        {(Object.keys(CATS) as CatKey[]).map(k => (
          <button key={k} className="cat" onClick={() => { resetSf({cat: k}); nav('/buscar'); }}><CatImg k={k} /><span>{CATS[k].label}</span></button>
        ))}
      </div>
    </section>
    <div className="grid" style={{'--min': '280px', gap: 16} as React.CSSProperties}>
      {o && (
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <span className="small muted">Seu pedido atual</span><b>{o.title}</b>
          <span className="chip o" style={{alignSelf: 'flex-start'}}>{STATUS[o.status]}</span>
          <button className="btn n w" onClick={() => nav('/pedidos/' + o.id)}>Abrir pedido</button>
        </div>
      )}
      <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--orT)', borderColor: 'var(--orL)'}}>
        <b style={{display: 'flex', gap: 6, alignItems: 'center'}}><Icon n="users" s={18} c="#FF8A3D" />Sua rede de confiança</b>
        <p className="small" style={{lineHeight: 1.5, color: 'var(--ink2)'}}>
          {plural(lv[1].length, 'conexão direta', 'conexões diretas')} e {lv[2].length} indiretas, criadas só por serviços concluídos e bem avaliados.
        </p>
        <button className="btn n w" onClick={() => nav('/perfil')}>Ver minha rede</button>
      </div>
      <div className="dark" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <b style={{display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="shield" s={20} c="#FF8A3D" />Pagamento protegido</b>
        <p className="small" style={{lineHeight: 1.55, color: '#E1E7F0'}}>O valor fica guardado e só vai para o profissional quando você confirma que o serviço ficou pronto.</p>
      </div>
    </div>
  </>;
}
