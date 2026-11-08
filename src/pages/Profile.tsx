import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Avatar, PortImg } from '../components/Avatar';
import { BackBtn, Bars, PersonBtn, OrderRow } from '../components/common';
import { Icon, Star } from '../components/Icon';
import TrustNetwork from '../components/TrustNetwork';
import { FeeBreakdown } from '../components/OfferForm';
import { CATS, TODAY } from '../data/seed';
import { brl, first, fmtDay, nf, plural, WDS, wd } from '../lib/format';
import type { Person } from '../lib/types';
import {
  common, dayState, doneOrders, freeDays, levels, links, match, pathTo, position, relWord, reviewsOf,
  type Edge, type LevelNode, type World
} from '../lib/world';
import { toast, useStore, useWorld } from '../store';

type Tab = 'rede' | 'aval' | 'serv' | 'hist';
const col = (gap = 10): CSSProperties => ({display: 'flex', flexDirection: 'column', gap});

function RelCard({w, ownId, e, cmSet, relF}: { w: World; ownId: string; e: Edge; cmSet: Set<string>; relF: string }) {
  const nav = useNavigate(), own = w.byId[ownId], u = w.byId[e.id];
  const sv = e.svc.filter(s => relF === 'all' || s.role === relF), s = sv[sv.length - 1], o = s.o;
  const hired = s.role === 'contratou', gave = hired ? o.ratePro! : o.rateClient!, got = hired ? o.rateClient! : o.ratePro!;
  return (
    <div className="rel">
      <Avatar u={u} size={48} />
      <div style={{flex: '1 1 240px', ...col(4)}}>
        <span style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
          <b>{u.name}</b><span className="lv lv1">Direta</span>
          {u.id === w.meId && <span className="chip o">Você</span>}
          {cmSet.has(u.id) && <span className="chip b">Em comum com você</span>}
        </span>
        <span className="small" style={{color: 'var(--ink2)'}}><b>{relWord(s.role, first(own.name), first(u.name))}</b> · {CATS[o.cat].label} · {o.date}</span>
        <span className="small" style={{display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'center'}}>
          <span style={{display: 'inline-flex', gap: 3, alignItems: 'center'}}><Star s={13} /><b>{nf(gave.stars)}</b>&nbsp;dada por {first(own.name)}</span>
          <span style={{display: 'inline-flex', gap: 3, alignItems: 'center'}}><Star s={13} /><b>{nf(got.stars)}</b>&nbsp;dada por {first(u.name)}</span>
        </span>
        <span className="small muted">“{gave.text}”</span>
        {e.svc.length > 1 && <span className="small muted">{e.svc.length} serviços avaliados entre os dois.</span>}
      </div>
      <button className="btn o sm" onClick={() => nav('/perfil/' + u.id)}>Ver perfil</button>
    </div>
  );
}

function IndSection({w, id, list, l}: { w: World; id: string; list: LevelNode[]; l: number }) {
  const fn = first(w.byId[id].name), max = 12, nav = useNavigate();
  return (
    <section style={col()}>
      <h2 style={{fontSize: 18, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}><span className={'lv lv' + l}>Nível {l}</span>{l === 2 ? 'Conexões indiretas' : 'Conexões mais distantes'} ({list.length})</h2>
      <p className="small muted" style={{lineHeight: 1.5}}>{fn} não teve experiência direta com estas pessoas. Elas aparecem porque {l === 2 ? 'alguém da rede direta de ' + fn : 'alguém do nível 2'} teve uma boa experiência com elas. <b style={{color: 'var(--navy)'}}>Não é uma indicação pessoal de {fn}.</b></p>
      {list.slice(0, max).map(n => {
        const u = w.byId[n.id], v = w.byId[n.via[0]], e = w.net[n.via[0]][n.id], s = e.svc[e.svc.length - 1];
        return (
          <div key={n.id} className="rel ind">
            <Avatar u={u} size={40} />
            <div style={{flex: '1 1 220px', ...col(3)}}>
              <span style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}><b>{u.name}</b><span className={'lv lv' + l}>Indireta · nível {l}</span>{u.id === w.meId && <span className="chip o">Você</span>}</span>
              <span className="small" style={{color: 'var(--ink2)'}}>via <Link className="lnk" to={'/perfil/' + v.id}>{first(v.name)}</Link>{n.via.length > 1 ? ` e mais ${n.via.length - 1}` : ''}: {relWord(s.role, first(v.name), first(u.name))} · {CATS[s.o.cat].label}</span>
            </div>
            <button className="btn o sm" onClick={() => nav('/perfil/' + u.id)}>Ver perfil</button>
          </div>
        );
      })}
      {list.length > max && <p className="small muted">E mais {list.length - max} pessoas neste nível.</p>}
    </section>
  );
}

function BookCard({p, bare}: { p: Person; bare?: boolean }) {
  const w = useWorld(), nav = useNavigate(), sendOrder = useStore(s => s.sendOrder);
  const [day, setDay] = useState<number | null>(null), [time, setTime] = useState<string | null>(null);
  const days = Array.from({length: 14}, (_, i) => TODAY + i);
  const send = () => { if (!day || !time) return; const id = sendOrder(p.id, day, time); toast('Pedido enviado para ' + first(p.name) + '.'); nav('/pedidos/' + id); };
  return (
    <div className={bare ? undefined : 'card'} style={bare ? col(14) : {border: '2px solid var(--navy)', ...col(14)}}>
      <h2 style={{fontSize: bare ? 22 : 18, paddingRight: bare ? 40 : 0}}>Contratar {first(p.name)}</h2>
      <div><span className="lbl">1. Escolha um dia livre</span>
        <div className="days">{days.map(d => {
          const st = dayState(w, p, d);
          return <button key={d} className={`day ${st} ${day === d ? 'sel' : ''}`} disabled={st !== 'free'} onClick={() => setDay(d)} aria-label={`${fmtDay(d)}, ${st === 'free' ? 'livre' : 'indisponível'}`}><small>{WDS[wd(d)]}</small>{d}</button>;
        })}</div>
        <p className="small muted" style={{marginTop: 8}}>Laranja: livre. Azul-escuro: ocupado. Cinza: folga.</p>
      </div>
      <div><span className="lbl">2. Escolha o horário</span>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>{['9h', '11h', '14h', '16h'].map(t => <button key={t} className="tog" aria-pressed={time === t} onClick={() => setTime(t)}>{t}</button>)}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, borderTop: '1px solid var(--soft)'}}>
        <span className="lbl" style={{margin: 0}}>Resumo estimado</span>
        <FeeBreakdown price={p.price} />
        <span className="small muted" style={{lineHeight: 1.45}}>Estimativa pelo preço inicial de {brl(p.price)}. O valor final vem no orçamento de {first(p.name)}, que recebe o valor do serviço sem desconto.</span>
      </div>
      <button className="btn w" disabled={!day || !time} onClick={send}>{day && time ? `3. Enviar pedido para ${fmtDay(day)}, ${time}` : '3. Enviar pedido'}</button>
      <p className="small muted" style={{display: 'flex', gap: 6}}><Icon n="shield" s={16} />Você só paga depois que {first(p.name)} aceitar, e o valor fica protegido.</p>
    </div>
  );
}

export default function Profile() {
  const params = useParams(), w = useWorld(), nav = useNavigate(), sf = useStore(s => s.sf);
  const id = params.id || w.meId;
  const [tab, setTab] = useState<Tab>('rede');
  const [rel, setRel] = useState<'all' | 'contratou' | 'prestou'>('all');
  const [lvl, setLvl] = useState(2);
  const [av, setAv] = useState<'all' | 'pro' | 'cli'>('all');
  const {hash} = useLocation(), mode = useStore(s => s.mode);
  const [hiring, setHiring] = useState(false);
  // "#contratar" no link abre direto a janela de contratação.
  useEffect(() => { setTab('rede'); setRel('all'); setLvl(2); setAv('all'); setHiring(hash === '#contratar'); }, [id, hash]);

  const p = w.byId[id];
  if (!p) return <><BackBtn /><div className="empty">Perfil não encontrado.</div></>;
  const self = id === w.meId, fn = first(p.name);
  // Contratar só faz sentido na área Contratar, no perfil de quem presta serviço.
  const canHire = p.provider && !self && mode === 'client';
  const L1 = links(w, id), lv = levels(w, id), cm = self ? [] : common(w, w.meId, id), cmSet = new Set(cm);
  const myE = self ? null : links(w, w.meId).find(e => e.id === id);
  const path = self || myE ? null : pathTo(w, w.meId, id);
  const m = !self && p.provider && sf.cat === p.cat ? match(w, p, {cat: sf.cat, day: typeof sf.avail === 'number' ? sf.avail : null, urgent: sf.avail === 'now'}) : null;
  const isNew = !p.count && !p.ccount;
  const tabs: [Tab, string][] = [['rede', 'Rede de confiança'], ['aval', 'Avaliações'], ...(p.provider ? [['serv', 'Serviços'] as [Tab, string]] : []), ...(self ? [['hist', 'Meu histórico'] as [Tab, string]] : [])];
  const cur = tabs.some(t => t[0] === tab) ? tab : 'rede';
  const st = (b: string | number, s: string) => <div className="statl"><b>{b}</b><span>{s}</span></div>;

  let body = null;
  if (cur === 'rede') {
    const L1f = L1.filter(e => rel === 'all' || e.svc.some(s => s.role === rel));
    const nH = L1.filter(e => e.svc.some(s => s.role === 'contratou')).length, nP = L1.filter(e => e.svc.some(s => s.role === 'prestou')).length;
    body = <>
      <section className="card" style={col(14)}>
        <div><h2 style={{fontSize: 20}}>Rede de confiança de {fn}</h2><p className="small muted" style={{marginTop: 4, lineHeight: 1.5}}>Pessoas com quem {fn} teve boas experiências (nota 4 ou 5 dos dois lados) em serviços concluídos na Freela. Ninguém entra aqui por indicação manual.</p></div>
        {L1.length ? <TrustNetwork id={id} lv={lv} maxL={lvl} setMaxL={setLvl} />
          : <div className="empty">{fn} ainda não tem conexões de confiança.<br />{isNew ? 'Perfis novos começam assim. Isso não é falta de confiança: a reputação se constrói a cada serviço concluído.' : 'As conexões aparecem depois de serviços bem avaliados dos dois lados.'}</div>}
      </section>
      {L1.length > 0 && (
        <section style={col()}>
          <h2 style={{fontSize: 18, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}><span className="lv lv1">Nível 1</span>Experiências diretas ({L1.length})</h2>
          <div className="ctrls">
            {([['all', 'Todas'], ['contratou', `Quando ${fn} contratou (${nH})`], ['prestou', `Quando ${fn} prestou serviço (${nP})`]] as const).map(([k, t]) =>
              <button key={k} className="tog" aria-pressed={rel === k} onClick={() => setRel(k)}>{t}</button>)}
          </div>
          {L1f.length ? L1f.map(e => <RelCard key={e.id} w={w} ownId={id} e={e} cmSet={cmSet} relF={rel} />) : <div className="empty">Nenhuma experiência desse tipo ainda.</div>}
        </section>
      )}
      {lvl >= 2 && lv[2].length > 0 && <IndSection w={w} id={id} list={lv[2]} l={2} />}
      {lvl >= 3 && lv[3].length > 0 && <IndSection w={w} id={id} list={lv[3]} l={3} />}
    </>;
  } else if (cur === 'aval') {
    const rv = reviewsOf(w, id), rvP = rv.filter(r => r.asPro), rvC = rv.filter(r => !r.asPro), rvF = av === 'pro' ? rvP : av === 'cli' ? rvC : rv;
    const box = (t: string, val: React.ReactNode, sub: string) => <div className="card" style={col(4)}><span className="small muted">{t}</span><p style={{fontSize: 24, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center'}}>{val}</p><span className="small muted">{sub}</span></div>;
    body = <>
      <div className="grid" style={{'--min': '220px'} as CSSProperties}>
        {box('Como prestador', p.count ? <><Star s={20} />{nf(p.rating)}</> : (p.provider ? 'Ainda sem avaliações' : '—'), p.provider ? `${plural(p.count, 'avaliação', 'avaliações')} de quem contratou ${fn}` : `${fn} não presta serviços`)}
        {box('Como contratante', p.ccount ? <><Star s={20} />{nf(p.crating)}</> : 'Ainda sem avaliações', `${plural(p.ccount, 'avaliação', 'avaliações')} de profissionais que atenderam ${fn}${p.ccount && p.crating >= 4.7 ? ' · Bom cliente' : ''}`)}
      </div>
      <div className="ctrls">
        {([['all', `Todas (${rv.length})`], ['pro', `Como prestador (${rvP.length})`], ['cli', `Como contratante (${rvC.length})`]] as const).map(([k, t]) =>
          <button key={k} className="tog" aria-pressed={av === k} onClick={() => setAv(k)}>{t}</button>)}
      </div>
      {rvF.length ? rvF.map(r => {
        const neg = r.r.stars <= 3, by = r.by;
        return (
          <div key={r.o.id} className="card" style={{padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', ...(neg ? {borderColor: '#F2B8B8', background: '#FFFBFB'} : {})}}>
            <Avatar u={by} size={40} />
            <div style={{flex: 1, minWidth: 0, ...col(5)}}>
              <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6}}>
                <Link className="lnk" style={{fontWeight: 700, color: 'var(--navy)'}} to={'/perfil/' + by.id}>{by.name}</Link>
                <span style={{display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700}}><Star s={14} />{nf(r.r.stars)}</span>
              </div>
              <span className="small muted">{r.asPro ? `${first(by.name)} contratou ${fn}` : `${first(by.name)} prestou serviço para ${fn}`} · {CATS[r.o.cat].label} · {r.o.date}</span>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                <span className={'chip ' + (r.asPro ? 'b' : '')}>Sobre {fn} como {r.asPro ? 'prestador' : 'contratante'}</span>
                {neg && <span className="chip neg">Experiência negativa · mantida no histórico</span>}
              </div>
              <p className="small" style={{lineHeight: 1.5, color: 'var(--ink2)'}}>{r.r.text}</p>
            </div>
          </div>
        );
      }) : <div className="empty">{isNew ? `${fn} é novo na Freela e ainda não recebeu avaliações. Isso não significa falta de confiança.` : 'Nenhuma avaliação deste tipo.'}</div>}
      <p className="small muted" style={{lineHeight: 1.5}}>Só serviços concluídos e registrados na Freela geram avaliações. Cada contratação aceita no máximo uma avaliação de cada lado, e as negativas não são escondidas.</p>
    </>;
  } else if (cur === 'serv') {
    const pos = position(w, p), free = freeDays(w, p, 6);
    body = <>
      <section className="card" style={col(12)}>
        <h2 style={{fontSize: 18}}>{p.role}</h2>
        <p style={{lineHeight: 1.6, color: 'var(--ink2)'}}>{p.bio}</p>
        <span className="small muted">{plural(p.years, 'ano', 'anos')} de experiência · {plural(p.count, 'serviço concluído', 'serviços concluídos')} na Freela · a partir de {brl(p.price)} · responde em cerca de {p.resp} min · {pos ? `${pos}º no ranking de ${CATS[p.cat].label.toLowerCase()}` : 'entra no ranking após o primeiro serviço avaliado'}</span>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}><span className="chip b">{CATS[p.cat].label}</span>{p.skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
      </section>
      <section className="card" style={col()}>
        <h2 style={{fontSize: 18}}>Disponibilidade</h2>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
          {p.now && <span className="chip o">Disponível agora</span>}
          {free.length ? free.map(d => <span key={d} className="chip">Livre {fmtDay(d)}</span>) : <span className="small muted">Sem dias livres este mês.</span>}
        </div>
      </section>
      <section className="card" style={col()}>
        <h2 style={{fontSize: 18}}>Certificados</h2>
        {p.certs.length ? p.certs.map(x => <div key={x} style={{display: 'flex', gap: 10, alignItems: 'center'}}><Icon n="award" s={22} c="#1F6FEB" /><span style={col(0)}><b className="small">{x}</b><span className="small muted">Certificado enviado</span></span></div>)
          : <p className="small muted">Nenhum certificado enviado ainda.</p>}
      </section>
      <section style={col()}>
        <h2 style={{fontSize: 18}}>Portfólio</h2>
        {p.port.length ? <div className="grid" style={{'--min': '150px'} as CSSProperties}>{p.port.map((x, i) => <div key={i} className="port"><PortImg cat={p.cat} i={i} /><span>{x}</span></div>)}</div>
          : <div className="empty">Ainda sem fotos de trabalhos.</div>}
      </section>
    </>;
  } else {
    const mine = w.orders.filter(o => o.clientId === id || o.proId === id).slice().reverse();
    const gave = doneOrders(w).filter(o => o.clientId === id || o.proId === id).length;
    body = (
      <section style={col()}>
        <h2 style={{fontSize: 20}}>Seu histórico de contratações e serviços</h2>
        <p className="small muted" style={{lineHeight: 1.5}}>Tudo o que você contratou e prestou nesta conta, com as notas que você deu e recebeu ({plural(gave, 'serviço avaliado', 'serviços avaliados')}). Valores e conversas só você e a outra pessoa veem.</p>
        {mine.length ? mine.map(o => <OrderRow key={o.id} o={o} />) : <div className="empty">Nenhuma contratação ainda.</div>}
      </section>
    );
  }

  let you = null;
  if (!self) {
    you = (
      <section className="card" style={{...col(), border: '2px solid var(--orL)'}}>
        <h2 style={{fontSize: 17, display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="users" s={20} c="#FF8A3D" />Você e {fn}</h2>
        {myE ? (() => { const s = myE.svc[myE.svc.length - 1]; return <p style={{lineHeight: 1.6}}><span className="lv lv1">Experiência direta</span> <b>{relWord(s.role, 'Você', fn)}</b> · {CATS[s.o.cat].label} · {s.o.date}. Os dois se avaliaram bem.</p>; })()
          : path ? <>
              <p style={{lineHeight: 1.8}}><span className={'lv lv' + Math.min(path.length - 1, 3)}>Conexão indireta · nível {path.length - 1}</span> Como você chega até {fn}:{' '}
                {path.map((x, i) => <span key={x}>{i > 0 && ' → '}{i === 0 ? <b>Você</b> : i === path.length - 1 ? <b>{fn}</b> : <Link className="lnk" to={'/perfil/' + x}>{first(w.byId[x].name)}</Link>}</span>)}
              </p>
              <p className="small muted">Não é uma indicação pessoal: mostra só serviços concluídos e bem avaliados entre essas pessoas.</p>
            </>
            : <p className="small muted" style={{lineHeight: 1.5}}>Vocês ainda não têm ligação na rede de confiança. Isso não significa falta de confiança: a rede cresce a cada serviço concluído e avaliado.</p>}
        {cm.length > 0 && <><p>Você e {fn} possuem <b>{plural(cm.length, 'conexão', 'conexões')} de confiança em comum</b>:</p><div className="people">{cm.map(x => <PersonBtn key={x} id={x} />)}</div></>}
      </section>
    );
  }

  return <>
    {!self && <BackBtn />}
    <section className="dark" style={{display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center'}}>
      <Avatar u={p} size={84} style={{border: '3px solid #FF8A3D'}} />
      <div style={{flex: '1 1 260px', ...col(6)}}>
        <h1 style={{fontSize: 30, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'}}>{p.name}{self && <span className="chip" style={{background: 'var(--or)', color: 'var(--navy)', fontSize: 12}}>Você</span>}</h1>
        <span style={{color: 'var(--pale)'}}>{p.provider ? p.role + ' · ' : ''}{p.hood} · na Freela desde {p.since}</span>
        {p.bio && <p className="small" style={{color: '#E1E7F0', lineHeight: 1.55, maxWidth: 640}}>{p.bio}</p>}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
          {p.verified && <span className="chip d"><Icon n="check" s={14} c="#7CC4FF" w={3} />Identidade verificada</span>}
          <span className="chip d">{p.provider ? 'Contrata e presta serviços' : 'Contrata serviços'}</span>
          {isNew ? <span className="chip" style={{background: 'var(--or)', color: 'var(--navy)'}}>Novo na Freela</span>
            : p.provider && !p.count ? <span className="chip" style={{background: 'var(--or)', color: 'var(--navy)'}}>Prestador novo</span> : null}
          {p.provider && p.now && <span className="chip" style={{background: 'var(--or)', color: 'var(--navy)'}}>Disponível agora</span>}
        </div>
      </div>
      {canHire && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
          <span className="small" style={{color: 'var(--pale)'}}>A partir de <b style={{color: '#fff', fontSize: 18}}>{brl(p.price)}</b></span>
          <button className="btn" onClick={() => setHiring(true)}><Icon n="briefcase" s={18} />Contratar serviço</button>
        </div>
      )}
    </section>
    <div className="grid" style={{'--min': '150px'} as CSSProperties}>
      {st(p.provider ? (p.count ? '★ ' + nf(p.rating) : 'Novo') : '—', p.provider ? `como prestador · ${plural(p.count, 'avaliação', 'avaliações')}` : 'não presta serviços')}
      {st(p.ccount ? '★ ' + nf(p.crating) : 'Novo', `como contratante · ${plural(p.ccount, 'avaliação', 'avaliações')}`)}
      {st(p.count + p.ccount, 'serviços concluídos na Freela')}
      <button className="statl" style={{textAlign: 'left'}} onClick={() => setTab('rede')}><b>{L1.length}</b><span>{L1.length === 1 ? 'conexão positiva' : 'conexões positivas'}</span></button>
      {!self && <div className="statl" style={{background: 'var(--orT)', borderColor: 'var(--orL)'}}><b>{cm.length}</b><span>{cm.length === 1 ? 'conexão' : 'conexões'} em comum com você</span></div>}
    </div>
    {you}
    <div className="tabs" role="tablist">
      {tabs.map(t => <button key={t[0]} role="tab" aria-selected={cur === t[0]} onClick={() => setTab(t[0])}>{t[1]}</button>)}
    </div>
    <div className="row">
      <div className="main-col">{body}</div>
      <aside className="side-col">
        {m && (
          <div className="dark" style={col(12)}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><b>Combina com sua busca</b><span style={{fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--or)'}}>{m.pct}%</span></div>
            <Bars m={m} dark />
          </div>
        )}
        {self && (
          <div className="card" style={col()}>
            <b>Este é o seu perfil</b>
            <p className="small muted" style={{lineHeight: 1.5}}>É assim que as outras pessoas veem você. Uma conta só: o que você contrata e o que você presta ficam juntos.</p>
            <button className="btn n w" onClick={() => nav('/trabalhar/perfil')}>Editar perfil de prestador</button>
            <button className="btn o w" onClick={() => nav('/trabalhar/agenda')}>Editar agenda</button>
          </div>
        )}
        <div className="card" style={col(8)}>
          <b style={{display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="shield" s={18} c="#1F6FEB" />Privacidade</b>
          <p className="small muted" style={{lineHeight: 1.5}}>Valores, endereços e conversas das contratações não aparecem na rede nem nas avaliações. Só as duas pessoas envolvidas veem esses detalhes.</p>
        </div>
      </aside>
    </div>
    {canHire && hiring && <HireModal p={p} onClose={() => setHiring(false)} />}
  </>;
}

/** Janela de contratação aberta pelo botão "Contratar serviço" do banner. */
function HireModal({p, onClose}: { p: Person; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="mbg" onClick={onClose}>
      <div className="modal hire-modal" role="dialog" aria-modal="true" aria-label={'Contratar ' + p.name} onClick={e => e.stopPropagation()}>
        <button className="pt-x" onClick={onClose} aria-label="Fechar">✕</button>
        <BookCard p={p} bare />
      </div>
    </div>
  );
}
