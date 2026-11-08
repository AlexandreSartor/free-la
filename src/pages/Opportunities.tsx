import { useState } from 'react';
import { RegionBar, SelBox } from '../components/common';
import { Icon } from '../components/Icon';
import JobCard from '../components/JobCard';
import { CATS, CITIES } from '../data/seed';
import { first, plural } from '../lib/format';
import type { CatKey, OppFilters } from '../lib/types';
import { oppList, pfActive } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function Opportunities() {
  const w = useWorld(), p = w.me;
  const f = useStore(s => s.pf), setPf = useStore(s => s.setPf), resetPf = useStore(s => s.resetPf);
  const [open, setOpen] = useState(false);
  const list = oppList(w, p, f), active = pfActive(f);
  const catNow = f.cat === 'mine' ? p.cat : f.cat;

  return <>
    <section style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      <h1 style={{fontSize: 28}}>Oportunidades para {first(p.name)}</h1>
      <p className="muted small">Pedidos publicados por clientes. Ver e enviar propostas é grátis.</p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
        <label htmlFor="pText" className="sr">Buscar oportunidades</label>
        <input type="text" id="pText" value={f.text} onChange={e => setPf({text: e.target.value})} placeholder="Buscar por palavra. Ex.: tomada, pintura, site" style={{flex: '1 1 260px'}} />
        <button className="btn o fbtn" aria-expanded={open} onClick={() => setOpen(!open)}><Icon n="filter" s={18} />Filtros{active ? ` (${active})` : ''}</button>
      </div>
      <RegionBar place="Pedidos em" city={f.city}
        items={w.jobs.filter(j => j.status === 'open' && j.dist !== 0 && j.hood && (catNow === 'all' || j.cat === catNow)).map(j => j.hood)}
        onCity={c => setPf({city: c})} />
    </section>
    <div className="row">
      <aside className={'fpanel' + (open ? ' open' : '')} style={{flex: '1 1 250px', flexDirection: 'column'}} aria-label="Filtros">
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{fontSize: 17}}>Filtros</h2>
            {active > 0 && <button className="gx" onClick={resetPf}>Limpar tudo</button>}
          </div>
          <SelBox id="pf-city" label="Cidade" value={f.city} onChange={v => setPf({city: v})} opts={[['all', 'Criciúma e região'], ...CITIES.map(c => [c, c] as [string, string])]} />
          <SelBox<OppFilters['cat']> id="pf-cat" label="Nicho" value={f.cat} onChange={v => setPf({cat: v})}
            opts={[['mine', `Minha área (${CATS[p.cat].label})`], ['all', 'Todos os serviços'], ...(Object.keys(CATS) as CatKey[]).map(k => [k, CATS[k].label] as [CatKey, string])]} />
          <SelBox id="pf-km" label="Distância de você" value={f.km} onChange={v => setPf({km: v})} opts={[[0, 'Toda a região'], [2, 'Até 2 km'], [5, 'Até 5 km'], [10, 'Até 10 km'], [15, 'Até 15 km'], [25, 'Até 25 km']]} />
          <SelBox id="pf-min" label="Orçamento do cliente" value={f.min} onChange={v => setPf({min: v})} opts={[[0, 'Qualquer valor'], [150, 'A partir de R$ 150'], [250, 'A partir de R$ 250'], [500, 'A partir de R$ 500'], [1000, 'A partir de R$ 1.000']]} />
          <SelBox<OppFilters['when']> id="pf-when" label="Quando" value={f.when} onChange={v => setPf({when: v})} opts={[['all', 'Qualquer data'], ['today', 'Hoje'], ['week', 'Próximos 7 dias'], ['free', 'Só nos meus dias livres']]} />
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            <button className="tog" aria-pressed={f.urgent} onClick={() => setPf({urgent: !f.urgent})}>Só urgentes</button>
            <button className="tog" aria-pressed={f.good} onClick={() => setPf({good: !f.good})}>Clientes nota 4,8+</button>
          </div>
        </div>
      </aside>
      <section className="main-col">
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center'}}>
          <b>{plural(list.length, 'oportunidade', 'oportunidades')}</b>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <label htmlFor="pf-sort" className="small muted">Ordenar por</label>
            <select id="pf-sort" className="sel" value={f.sort} onChange={e => setPf({sort: e.target.value as OppFilters['sort']})}>
              {[['match', 'Mais compatível'], ['dist', 'Mais perto'], ['budget', 'Maior orçamento'], ['recent', 'Mais recente'], ['day', 'Data mais próxima']].map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
            </select>
          </div>
        </div>
        {list.length ? list.map(x => <JobCard key={x.j.id} j={x.j} m={x.m} p={p} />)
          : <div className="empty">Nenhuma oportunidade com esses filtros.<br /><br /><button className="btn o" onClick={resetPf}>Limpar filtros</button></div>}
      </section>
    </div>
  </>;
}
