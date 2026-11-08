import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATS, CITIES, CRI_HOODS } from '../data/seed';
import { brl, brlc, clientTotal, cityOf, first, fmtDay, locTxt, nf, plural } from '../lib/format';
import type { Match, Order, Person } from '../lib/types';
import { common, isDirect, POS } from '../lib/world';
import { useWorld } from '../store';
import { Avatar } from './Avatar';
import { Icon, Star } from './Icon';

export const STATUS = {sent: 'Aguardando o profissional', accepted: 'Orçamento recebido', paid: 'Pago com proteção', done: 'Serviço concluído', rated: 'Finalizado'};
export const STEPIDX = {sent: 1, accepted: 2, paid: 3, done: 4, rated: 5};

export function BackBtn({label = 'Voltar', to}: { label?: string; to?: string }) {
  const nav = useNavigate();
  return (
    <button className="btn o" style={{alignSelf: 'flex-start', minHeight: 40, fontSize: 14}} onClick={() => to ? nav(to) : (window.history.length > 1 ? nav(-1) : nav('/'))}>
      <Icon n="back" s={18} />{label}
    </button>
  );
}

export const Verified = ({p}: { p: Person }) => p.verified ? <span title="Identidade verificada" style={{display: 'inline-flex'}}><Icon n="check" s={16} c="#1F6FEB" w={3} /></span> : null;

export function Bars({m, dark}: { m: Match; dark?: boolean }) {
  return <>{m.reasons.map(r => (
    <div key={r[0]} style={{display: 'flex', flexDirection: 'column', gap: 5}}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13}}><span style={{color: dark ? '#E1E7F0' : 'var(--ink2)'}}>{r[0]}</span><b>{r[1]}</b></div>
      <div className="bar"><i style={{width: r[2] + '%'}} /></div>
    </div>
  ))}</>;
}

export function TrustMini({u}: { u?: Person }) {
  const w = useWorld();
  if (!u || u.id === w.meId) return null;
  const cm = common(w, w.meId, u.id), dir = isDirect(w, u.id);
  if (!cm.length && !dir) return null;
  return (
    <span className="small" style={{display: 'inline-flex', gap: 5, alignItems: 'center', color: 'var(--navy)', marginTop: 3}}>
      <Icon n="users" s={13} c="#FF8A3D" />{dir ? 'Experiência direta com você' : plural(cm.length, 'conexão', 'conexões') + ' de confiança em comum com você'}
    </span>
  );
}

export function PersonBtn({id}: { id: string }) {
  const w = useWorld(), nav = useNavigate(), u = w.byId[id];
  return <button className="pbtn" onClick={() => nav('/perfil/' + u.id)}><Avatar u={u} size={28} /><span>{first(u.name)}</span></button>;
}

export function ProCard({p}: { p: Person }) {
  const w = useWorld(), nav = useNavigate();
  const cm = common(w, w.meId, p.id).length, dir = isDirect(w, p.id);
  return (
    <button className="pcard" onClick={() => nav('/perfil/' + p.id)}>
      <Avatar u={p} size={56} />
      <span className="pc-main">
        <span className="pc-name">{p.name} <Verified p={p} /></span>
        <span className="pc-role">{p.role}</span>
        <span className="pc-meta">
          {p.count ? <><Star s={14} /><b>{nf(p.rating)}</b><span className="muted">({plural(p.count, 'avaliação', 'avaliações')})</span></>
            : <span className="chip o" style={{padding: '2px 8px', fontSize: 11}}>Novo na Freela</span>}
          <span className="dot" /><span>{plural(p.jobs, 'serviço concluído', 'serviços concluídos')}</span>
        </span>
        <span className="pc-meta muted"><Icon n="pin" s={13} />{locTxt(p)}</span>
        {dir ? <span className="pc-cm"><Icon n="users" s={13} c="#FF8A3D" />Experiência direta com você</span>
          : cm ? <span className="pc-cm"><Icon n="users" s={13} c="#FF8A3D" />{plural(cm, 'conexão', 'conexões')} de confiança em comum</span> : null}
      </span>
      <span className="pc-price">{p.price ? <><small>a partir de</small><b>{brl(p.price)}</b></> : <small>preço a combinar</small>}</span>
    </button>
  );
}

export function OrderRow({o}: { o: Order }) {
  const w = useWorld(), nav = useNavigate();
  const asP = o.proId === w.meId, other = w.byId[asP ? o.clientId : o.proId];
  const gave = asP ? o.rateClient : o.ratePro, got = asP ? o.ratePro : o.rateClient;
  return (
    <button className="pro-item" style={{flexWrap: 'wrap'}} onClick={() => nav('/pedidos/' + o.id)}>
      <Avatar u={other} size={46} />
      <span style={{flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3}}>
        <b>{o.title}</b>
        <span className="small muted">{asP ? 'Você prestou serviço para ' : 'Você contratou '}{other.name} · {o.date ? 'concluído em ' + o.date : <DayTime o={o} />}{o.price ? ' · ' + brlc(asP ? o.price : clientTotal(o.price, o.insured)) : ''}</span>
        {o.status === 'rated' && gave && got && (
          <span className="small" style={{display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', color: 'var(--ink2)'}}>
            Você deu <Star s={12} /><b>{gave.stars}</b> · recebeu <Star s={12} /><b>{got.stars}</b> ·{' '}
            {gave.stars >= POS && got.stars >= POS ? <span className="lv lv1">Conexão de confiança</span> : <span className="chip neg" style={{padding: '2px 8px'}}>Sem conexão</span>}
          </span>
        )}
      </span>
      <span className={'chip ' + (o.status === 'rated' ? '' : 'o')}>{STATUS[o.status]}</span>
    </button>
  );
}

export const DayTime = ({o}: { o: { day: number | null; time: string } }) => <>{o.day ? fmtDay(o.day) : ''}{o.time ? ', ' + o.time : ''}</>;

export function Empty({children}: { children: ReactNode }) { return <div className="empty">{children}</div>; }

export function SelBox<T extends string | number>({id, label, opts, value, onChange}: { id: string; label: string; opts: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <label className="lbl" htmlFor={id}>{label}</label>
      <select id={id} value={String(value)} onChange={e => { const raw = e.target.value; const o = opts.find(x => String(x[0]) === raw); if (o) onChange(o[0]); }}
        style={{width: '100%', minHeight: 44, borderRadius: 12, border: '1px solid var(--line2)', background: '#fff', padding: '0 10px', fontSize: 14}}>
        {opts.map(o => <option key={String(o[0])} value={String(o[0])}>{o[1]}</option>)}
      </select>
    </div>
  );
}

/** Faixa de região: cidades da AMREC e, em Criciúma, os bairros. Mostra quantos resultados há em cada uma. */
export function RegionBar({place, city, hood, items, onCity, onHood}: { place: string; city: string; hood?: string; items: string[]; onCity: (c: string) => void; onHood?: (h: string) => void }) {
  const n = (c: string) => items.filter(h => c === 'all' || cityOf(h) === c).length;
  return (
    <div className="region-bar" role="group" aria-label="Filtrar por região">
      <div className="rgrow">
        <span className="small" style={{fontWeight: 700, display: 'inline-flex', gap: 5, alignItems: 'center'}}><Icon n="pin" s={16} c="#FF8A3D" />{place}:</span>
        <button className="tog rg" aria-pressed={city === 'all'} onClick={() => onCity('all')}>Toda a região <span className="rgn">{n('all')}</span></button>
        {CITIES.map(c => <button key={c} className="tog rg" aria-pressed={city === c} onClick={() => onCity(c)}>{c} <span className="rgn">{n(c)}</span></button>)}
      </div>
      {onHood && city === 'Criciúma' && (
        <div className="rgrow">
          <span className="small muted">Bairro:</span>
          {['all', ...CRI_HOODS].map(h => (
            <button key={h} className="tog rg" aria-pressed={hood === h} onClick={() => onHood(h)}>
              {h === 'all' ? 'Todos' : h} <span className="rgn">{h === 'all' ? n('Criciúma') : items.filter(x => x === h + ', Criciúma').length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const catOpts = () => Object.entries(CATS).map(([k, c]) => [k, c.label] as [string, string]);
