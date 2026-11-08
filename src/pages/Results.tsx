import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProCard, RegionBar, SelBox } from '../components/common';
import { Icon } from '../components/Icon';
import { CATS, CITIES, TODAY } from '../data/seed';
import { cityOf, fmtDay, hoodOf, plural } from '../lib/format';
import type { SearchFilters } from '../lib/types';
import { provs, searchPros, SF0 } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function Results() {
  const w = useWorld(), nav = useNavigate();
  const f = useStore(s => s.sf), setSf = useStore(s => s.setSf), resetSf = useStore(s => s.resetSf);
  const [open, setOpen] = useState(false);
  const {list, active} = searchPros(w, f);
  const nF = active.length;
  const others = provs(w).filter(p => p.id !== w.meId);
  const hoods = [...new Set(others.filter(p => cityOf(p.hood) === 'Criciúma').map(p => hoodOf(p.hood)))].sort((a, b) => a.localeCompare(b, 'pt'));
  const del = (k: keyof SearchFilters) => setSf({[k]: SF0()[k]} as Partial<SearchFilters>);
  const dayOpts: [number, string][] = Array.from({length: 7}, (_, i) => [TODAY + i, 'Livre ' + fmtDay(TODAY + i)]);

  return <>
    <section className="sx">
      <h1 style={{fontSize: 26}}>Qual serviço você procura?</h1>
      <div className="sbar">
        <Icon n="search" s={20} c="#55627A" />
        <label htmlFor="sText" className="sr">Qual serviço você procura?</label>
        <input type="text" id="sText" value={f.text} onChange={e => setSf({text: e.target.value})} placeholder="Busque por serviço ou nome do profissional" autoComplete="off" />
        {f.text && <button className="gx" onClick={() => setSf({text: ''})} aria-label="Limpar busca">✕</button>}
      </div>
      <RegionBar place="Profissionais em" city={f.city} hood={f.hood}
        items={others.filter(p => p.dist !== 0 && (f.cat === 'all' || p.cat === f.cat)).map(p => p.hood)}
        onCity={c => setSf({city: c, hood: 'all'})} onHood={h => setSf({hood: h})} />
      <div className="fbar">
        <button className="tog" aria-expanded={open} aria-controls="fpane" aria-pressed={open || nF > 0} onClick={() => setOpen(!open)}>
          <Icon n="filter" s={16} />Filtros{nF ? ` (${nF})` : ''}
        </button>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto'}}>
          <label htmlFor="sf-sort" className="small muted">Ordenar</label>
          <select id="sf-sort" className="sel" value={f.sort} onChange={e => setSf({sort: e.target.value as SearchFilters['sort']})}>
            {[['best', 'Relevância'], ['rating', 'Melhor nota'], ['price', 'Menor preço'], ['dist', 'Mais perto'], ['jobs', 'Mais serviços']].map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
          </select>
        </div>
      </div>
      {open && (
        <div className="fpane" id="fpane">
          <div className="grid" style={{'--min': '170px'} as CSSProperties}>
            <SelBox id="sf-city" label="Cidade" value={f.city} onChange={v => setSf({city: v, hood: 'all'})} opts={[['all', 'Criciúma e região'], ...CITIES.map(c => [c, c] as [string, string])]} />
            {f.city === 'Criciúma' && <SelBox id="sf-hood" label="Bairro" value={f.hood} onChange={v => setSf({hood: v})} opts={[['all', 'Todos os bairros'], ...hoods.map(h => [h, h] as [string, string])]} />}
            <SelBox id="sf-km" label="Distância" value={f.km} onChange={v => setSf({km: v})} opts={[[0, 'Qualquer distância'], [2, 'Até 2 km'], [5, 'Até 5 km'], [10, 'Até 10 km'], [15, 'Até 15 km'], [25, 'Até 25 km']]} />
            <SelBox id="sf-price" label="Preço inicial" value={f.price} onChange={v => setSf({price: v})} opts={[[0, 'Qualquer preço'], [100, 'Até R$ 100'], [150, 'Até R$ 150'], [200, 'Até R$ 200'], [300, 'Até R$ 300'], [600, 'Até R$ 600'], [1500, 'Até R$ 1.500']]} />
            <SelBox id="sf-rating" label="Avaliação mínima" value={f.rating} onChange={v => setSf({rating: v})} opts={[[0, 'Qualquer nota'], [4, '4,0 ou mais'], [4.5, '4,5 ou mais'], [4.8, '4,8 ou mais']]} />
            <SelBox<SearchFilters['avail']> id="sf-avail" label="Disponibilidade" value={f.avail} onChange={v => setSf({avail: v})} opts={[['any', 'Qualquer dia'], ['now', 'Disponível agora'], ...dayOpts]} />
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
            <button className="tog" aria-pressed={f.verified} onClick={() => setSf({verified: !f.verified})}><Icon n="check" s={14} />Só verificados</button>
            <button className="tog" aria-pressed={f.online} onClick={() => setSf({online: !f.online})}>Inclui online</button>
            <button className="tog" aria-pressed={f.certs} onClick={() => setSf({certs: !f.certs})}>Com certificado</button>
            <button className="tog" aria-pressed={f.women} onClick={() => setSf({women: !f.women})}>Profissional mulher</button>
            <span style={{marginLeft: 'auto', display: 'flex', gap: 8}}>
              {nF > 0 && <button className="gx" onClick={() => resetSf({text: f.text, cat: f.cat, sort: f.sort})}>Limpar filtros</button>}
              <button className="btn n sm" onClick={() => setOpen(false)}>Ver resultados</button>
            </span>
          </div>
        </div>
      )}
    </section>
    <section style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
        <b>{plural(list.length, 'profissional', 'profissionais')}</b>
        {f.cat !== 'all' && <button className="chip o" style={{border: 0}} onClick={() => setSf({cat: 'all'})} aria-label={'Remover categoria ' + CATS[f.cat].label}>{CATS[f.cat].label} ✕</button>}
        {active.map(a => <button key={a[0]} className="chip o" style={{border: 0}} onClick={() => del(a[0])} aria-label={'Remover filtro ' + a[1]}>{a[1]} ✕</button>)}
      </div>
      {list.length
        ? <div className="grid" style={{'--min': '330px'} as CSSProperties}>{list.map(x => <ProCard key={x.p.id} p={x.p} />)}</div>
        : <div className="empty">Nenhum profissional encontrado.<br /><br /><button className="btn o" onClick={() => resetSf()}>Limpar busca e filtros</button></div>}
      {f.cat !== 'all' && (
        <div className="pubhint">
          <span>Não encontrou quem procura? Publique um pedido de {CATS[f.cat].label.toLowerCase()} e receba propostas.</span>
          <button className="btn o sm" onClick={() => nav(`/publicar?cat=${f.cat}`)}>Publicar pedido</button>
        </div>
      )}
    </section>
  </>;
}
