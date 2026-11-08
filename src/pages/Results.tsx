import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProCard, SelBox } from '../components/common';
import { Icon } from '../components/Icon';
import { CATS, CITIES, TODAY } from '../data/seed';
import { cityOf, fmtDay, plural } from '../lib/format';
import type { SearchFilters } from '../lib/types';
import { searchPros, SF0 } from '../lib/world';
import { useStore, useWorld } from '../store';

export default function Results() {
  const w = useWorld(), nav = useNavigate();
  const f = useStore(s => s.sf), setSf = useStore(s => s.setSf), resetSf = useStore(s => s.resetSf);
  const [open, setOpen] = useState(false);
  const {list, active: all, approx} = searchPros(w, f);
  // A cidade já aparece na caixa de seleção, então não vira chip nem conta como filtro extra.
  const active = all.filter(a => a[0] !== 'city'), nF = active.length;
  // Contagem por cidade com a mesma busca e filtros, só sem a cidade (online conta em "Todas as cidades").
  const inAll = searchPros(w, {...f, city: 'all'}).list;
  const cityOpts: [string, string][] = [['all', `Todas as cidades (${inAll.length})`], ...CITIES.map(c => [c, `${c} (${inAll.filter(x => cityOf(x.p.hood) === c).length})`] as [string, string])];
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
      <div className="fbar">
        <label className="city-sel">
          <Icon n="pin" s={16} c="#FF8A3D" />
          <span className="sr">Cidade</span>
          <select value={f.city} onChange={e => setSf({city: e.target.value})}>
            {cityOpts.map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
          </select>
        </label>
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
              {nF > 0 && <button className="gx" onClick={() => resetSf({text: f.text, cat: f.cat, sort: f.sort, city: f.city})}>Limpar filtros</button>}
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
      {approx && <p className="small muted">Nenhum resultado exato para “{f.text.trim()}”. Mostrando profissionais com termos parecidos.</p>}
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
