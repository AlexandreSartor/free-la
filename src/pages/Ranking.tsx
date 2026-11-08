import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { CATS } from '../data/seed';
import { nf } from '../lib/format';
import type { CatKey } from '../lib/types';
import { rankList } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function Ranking() {
  const w = useWorld(), nav = useNavigate(), rank = useStore(s => s.rank), setRank = useStore(s => s.setRank);
  const tabs: [CatKey | 'all', string][] = [['all', 'Todos'], ...(Object.keys(CATS) as CatKey[]).map(k => [k, CATS[k].label] as [CatKey, string])];
  const list = rankList(w, rank), top = list.slice(0, 3), rest = list.slice(3), ex = list[0];

  return <>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <h1 style={{fontSize: 30}}>Ranking de Criciúma e região</h1>
      <p className="muted small">Só contam avaliações de serviços concluídos na Freela. Atualiza a cada nova avaliação. Prestadores novos entram depois do primeiro serviço avaliado.</p>
    </div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
      {tabs.map(t => <button key={t[0]} className="tog" aria-pressed={rank === t[0]} onClick={() => setRank(t[0])}>{t[1]}</button>)}
    </div>
    <div className="grid" style={{'--min': '230px'} as CSSProperties}>
      {top.map((x, i) => (
        <button key={x.p.id} className={i === 0 ? 'dark' : 'card'} onClick={() => nav('/perfil/' + x.p.id)}
          style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, border: i === 0 ? 0 : '1px solid var(--line)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: 36, fontWeight: 700}}>{i + 1}º</span>
            <span className="chip o">{x.s.total} pontos</span>
          </div>
          <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <Avatar u={x.p} size={50} />
            <span style={{display: 'flex', flexDirection: 'column', gap: 2}}><b>{x.p.name}</b><span className="small" style={{color: i === 0 ? 'var(--pale)' : 'var(--muted)'}}>{x.p.role}</span></span>
          </div>
          <span className="small" style={{color: i === 0 ? 'var(--pale)' : 'var(--muted)'}}>Nota {nf(x.p.rating)} · {x.p.jobs} serviços · {x.p.certs.length} certificados</span>
        </button>
      ))}
    </div>
    {!list.length && <div className="empty">Ainda não há profissionais avaliados nesta categoria.</div>}
    <div className="row">
      <section className="main-col card" style={{padding: '6px 8px', overflowX: 'auto'}}>
        {rest.length ? (
          <table className="tbl">
            <thead><tr><th>Pos.</th><th>Profissional</th><th>Nota</th><th>Serviços</th><th>Pontos</th></tr></thead>
            <tbody>{rest.map((x, i) => (
              <tr key={x.p.id} className="click" onClick={() => nav('/perfil/' + x.p.id)}>
                <td><b>{i + 4}º</b></td><td><b>{x.p.name}</b><br /><span className="small muted">{x.p.role}</span></td>
                <td>{nf(x.p.rating)}</td><td>{x.p.jobs}</td><td><b>{x.s.total}</b></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="small muted" style={{padding: 12}}>Só há esses profissionais nesta categoria.</p>}
      </section>
      <aside className="side-col">
        <div className="dark" style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <h2 style={{fontSize: 17}}>Como a pontuação é calculada</h2>
          {ex && <>
            <p className="small" style={{color: 'var(--pale)'}}>Exemplo: {ex.p.name}</p>
            {ex.s.parts.map(pt => <div key={pt[0]} style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}><span style={{color: '#E1E7F0'}}>{pt[0]}</span><b>+{pt[1]}</b></div>)}
            <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--navy3)', paddingTop: 8}}><span>Total</span><b style={{color: 'var(--or)'}}>{ex.s.total}</b></div>
          </>}
          <p className="small" style={{color: 'var(--pale)', lineHeight: 1.5}}>Nota × 100, serviços (até 250), 25 por certificado, 30 se verificado e até 40 por responder rápido.</p>
        </div>
      </aside>
    </div>
  </>;
}
