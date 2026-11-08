import { useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { BackBtn, Bars, DayTime, STEPIDX } from '../components/common';
import { Icon, IC, Star } from '../components/Icon';
import { brl, brlc, clientTotal, first, fmtDay, nf } from '../lib/format';
import { FeeBreakdown } from '../components/OfferForm';
import { cTxt, POS } from '../lib/world';
import { toast, useStore, useWorld } from '../store';

export function StarsInput({value, onChange}: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="stars" role="group" aria-label="Nota">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} aria-label={i + ' estrelas'} aria-pressed={i <= value} onClick={() => onChange(i)}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill={i <= value ? '#E0A800' : 'none'} stroke="#C99700" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d={IC.star} /></svg>
        </button>
      ))}
    </div>
  );
}

const col: CSSProperties = {display: 'flex', flexDirection: 'column', gap: 12};

export default function OrderPage() {
  const {id} = useParams(), nav = useNavigate(), w = useWorld();
  const a = useStore();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const o = w.orders.find(x => x.id === id);
  if (!o) return <><BackBtn /><div className="empty">Pedido não encontrado.</div></>;

  const p = w.byId[o.proId], cli = w.byId[o.clientId], c = o.clientId === w.meId, asPro = o.proId === w.meId;
  if (!c && !asPro) return <>
    <BackBtn />
    <section className="card" style={col}>
      <b style={{display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="shield" s={20} c="#1F6FEB" />Contratação privada</b>
      <p className="small muted" style={{lineHeight: 1.5}}>Valores, mensagens e detalhes desta contratação só aparecem para {cli.name} e {p.name}.</p>
    </section>
  </>;

  const other = c ? p : cli, idx = STEPIDX[o.status];
  const fnP = first(p.name), fnC = first(cli.name);
  const defText = c ? 'Pontual, cuidadoso e deixou tudo limpo.' : 'Cliente atencioso, explicou tudo e pagou pelo app.';
  const quoteLink = '/trabalhar/pedidos/' + o.id + '/orcamento';

  const submitRate = () => {
    const r = a.rate(o.id, {stars, text: (text ?? defText).trim() || 'Ótima experiência.'});
    if (r === 'invalid') toast('Esta contratação já foi avaliada por você. Cada lado avalia uma única vez.');
    else if (r === 'pending') toast('Avaliação enviada. Ela aparece quando o outro lado avaliar.');
    else toast(r === 'connected' ? `Avaliações liberadas. Nova conexão de confiança entre ${fnC} e ${fnP}.` : 'Avaliações liberadas e registradas no histórico, sem gerar conexão.');
  };
  const simRate = () => {
    const r = a.simRate(o.id);
    if (r !== 'invalid') toast(r === 'connected' ? `Avaliações liberadas. Nova conexão de confiança entre ${fnC} e ${fnP}.` : 'Avaliações liberadas e registradas no histórico, sem gerar conexão.');
  };
  const send = () => { const t = msg.trim(); if (!t) return; a.sendMsg(o.id, t); setMsg(''); };

  let action = null;
  if (o.status === 'sent') action = c
    ? <div className="card" style={col}>
        <b>Pedido enviado para {fnP}.</b>
        <p className="small muted" style={{lineHeight: 1.5}}>Agora {fnP} analisa e manda o orçamento. Você recebe um aviso quando chegar.</p>
        <div><button className="btn o" onClick={() => { a.simAccept(o.id); toast(`${fnP} aceitou. Deu match!`); }}>Simular a resposta de {fnP}</button></div>
      </div>
    : <div className="dark" style={col}>
        <b style={{fontSize: 18}}>Novo pedido{o.match ? `: ${o.match.pct}% compatível com você` : ''}</b>
        <p className="small" style={{color: '#E1E7F0'}}>{cli.name} · {cTxt(cli)} · <DayTime o={o} /></p>
        <div><button className="btn" onClick={() => nav(quoteLink)}>Responder com orçamento</button></div>
      </div>;
  else if (o.status === 'accepted') action = c
    ? <div className="dark" style={col}>
        <b style={{fontSize: 18, display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="shield" s={22} c="#FF8A3D" />Pagamento protegido</b>
        <p className="small" style={{color: '#E1E7F0', lineHeight: 1.5}}>O valor fica guardado na Freela e só vai para {fnP} quando você confirmar que o serviço ficou pronto. {fnP} recebe o valor do serviço integral.</p>
        <FeeBreakdown price={o.price!} dark insured={o.insured} />
        <div><button className="btn" onClick={() => { a.pay(o.id); toast('Pagamento guardado com proteção.'); }}>Pagar {brlc(clientTotal(o.price!, o.insured))} com proteção</button></div>
      </div>
    : <div className="card" style={col}>
        <b>Orçamento aceito: você recebe {brlc(o.price!)}.</b>
        <p className="small muted">Aguardando {fnC} pagar. O dia {o.day}/11 já aparece como ocupado na sua agenda.</p>
        <div><button className="btn o" onClick={() => { a.pay(o.id); toast(`${fnC} pagou com proteção.`); }}>Simular: {fnC} paga</button></div>
      </div>;
  else if (o.status === 'paid') action = c
    ? <div className="card" style={col}>
        <b>Serviço agendado: <DayTime o={o} />.</b>
        <p className="small muted">{brlc(clientTotal(o.price!, o.insured))} guardados com proteção ({brl(o.price!)} do serviço + taxa{o.insured ? ' + compra segurada' : ''}). Quando o serviço terminar, confirme aqui.</p>
        <div><button className="btn" onClick={() => { a.finish(o.id); toast('Pagamento liberado para o profissional.'); }}>Confirmar que o serviço foi concluído</button></div>
      </div>
    : <div className="card" style={col}>
        <b>Pagamento garantido: {brl(o.price!)}.</b>
        <p className="small muted">Você recebe {brlc(o.price!)}, sem taxa, assim que {fnC} confirmar.</p>
        <div><button className="btn o" onClick={() => { a.finish(o.id); toast('Pagamento liberado para você.'); }}>Simular: {fnC} confirma a conclusão</button></div>
      </div>;
  else if (o.status === 'done') {
    const mineDone = c ? o.ratePro : o.rateClient;
    action = !mineDone
      ? <div className="card" style={{...col, gap: 10, border: '2px solid var(--navy)'}}>
          <h2 style={{fontSize: 18}}>{c ? `Como foi com ${fnP}?` : `Como foi atender ${fnC}?`}</h2>
          <StarsInput value={stars} onChange={setStars} />
          <label className="lbl" htmlFor="rv">Comentário</label>
          <textarea id="rv" rows={2} value={text ?? defText} onChange={e => setText(e.target.value)} />
          <button className="btn" style={{alignSelf: 'flex-start'}} onClick={submitRate}>Enviar avaliação</button>
          <p className="small muted" style={{lineHeight: 1.5}}>Uma avaliação por contratação, de cada lado. As duas aparecem juntas, para ninguém avaliar com medo de retaliação. Nota 4 ou 5 dos dois lados cria uma conexão de confiança; notas baixas ficam no histórico e não criam conexão.</p>
        </div>
      : <div className="card" style={col}>
          <b>Sua avaliação foi enviada.</b>
          <p className="small muted">Ela aparece quando {first(other.name)} também avaliar. Não é possível avaliar de novo esta contratação.</p>
          <div><button className="btn o" onClick={simRate}>Simular a avaliação de {first(other.name)}</button></div>
        </div>;
  } else if (o.ratePro && o.rateClient) {
    const pos = o.ratePro.stars >= POS && o.rateClient.stars >= POS;
    action = <>
      <div className="grid" style={{'--min': '240px'} as CSSProperties}>
        <div className="card"><span className="small muted">{fnC} avaliou {fnP}</span><p style={{margin: '6px 0', display: 'flex', gap: 3, alignItems: 'center'}}><Star s={16} /><b>{nf(o.ratePro.stars)}</b></p><p className="small" style={{color: 'var(--ink2)'}}>{o.ratePro.text}</p></div>
        <div className="card"><span className="small muted">{fnP} avaliou {fnC}</span><p style={{margin: '6px 0', display: 'flex', gap: 3, alignItems: 'center'}}><Star s={16} /><b>{nf(o.rateClient.stars)}</b></p><p className="small" style={{color: 'var(--ink2)'}}>{o.rateClient.text}</p></div>
      </div>
      {pos
        ? <div className="card" style={{...col, gap: 10, background: 'var(--orT)', borderColor: 'var(--orL)'}}>
            <b style={{display: 'flex', gap: 8, alignItems: 'center'}}><Icon n="users" s={20} c="#FF8A3D" />Conexão de confiança {o.seed ? 'registrada' : 'criada'}</b>
            <p className="small" style={{lineHeight: 1.55, color: 'var(--ink2)'}}>Os dois se avaliaram bem, então a ligação aparece na rede de confiança de ambos, com os papéis invertidos: “{fnC} contratou {fnP}” no perfil de {fnC} e “{fnP} prestou serviço para {fnC}” no perfil de {fnP}.</p>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
              <button className="btn o" onClick={() => nav('/perfil/' + p.id)}>Ver rede de {fnP}</button>
              <button className="btn o" onClick={() => nav('/perfil/' + cli.id)}>Ver rede de {fnC}</button>
            </div>
          </div>
        : <div className="card" style={{...col, gap: 8}}><b>Sem conexão de confiança</b><p className="small muted" style={{lineHeight: 1.5}}>As avaliações ficam visíveis no histórico dos dois perfis, mas experiências abaixo de 4 estrelas não criam conexão.</p></div>}
    </>;
  }

  const steps = ['Pedido enviado', 'Orçamento aceito', 'Pago com proteção', 'Serviço concluído', 'Avaliações'];

  return <>
    <BackBtn />
    <section className="card" style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start'}}>
        <span style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <h1 style={{fontSize: 24, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'}}>{o.title}{o.insured && <span className="chip avail"><Icon n="shield" s={13} c="#166534" />Compra segurada</span>}</h1>
          <span className="small muted">{c ? 'Você contratou' : 'Você atende'} <Link className="lnk" to={'/perfil/' + other.id}>{other.name}</Link> · {o.date ? 'concluído em ' + o.date : <>{o.day ? fmtDay(o.day) : ''}, às {o.time}</>}</span>
          {o.desc && <span className="small" style={{color: 'var(--ink2)'}}>“{o.desc}”</span>}
        </span>
        <b style={{fontSize: 22, textAlign: 'right'}}>{o.price ? <>{brlc(c ? clientTotal(o.price, o.insured) : o.price)}<br /><span className="small muted" style={{fontWeight: 500}}>{c ? (o.insured ? 'total com taxa e seguro' : 'total com taxa de proteção') : 'você recebe, sem taxa'}</span></> : <span className="small muted">{o.seed ? 'valor visível só para os dois' : 'aguardando orçamento'}</span>}</b>
      </div>
      <div className="steps5">{steps.map((s, i) => <div key={s} className={i < idx ? 'ok' : ''}><i />{s}</div>)}</div>
    </section>
    <div className="row">
      <div className="main-col">
        {o.match && idx >= 2 && (
          <section className="dark" style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12}}>
              <Avatar u={cli} size={52} /><span><Icon n="match" s={26} c="#FF8A3D" w={2.4} /></span><Avatar u={p} size={52} />
              <span style={{flex: '1 1 160px'}}><b style={{fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: 24}}>Deu match!</b><br /><span className="small" style={{color: 'var(--pale)'}}>{fnC} precisa, {fnP} faz.</span></span>
              <span style={{fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--or)'}}>{o.match.pct}%</span>
            </div>
            <div className="grid" style={{'--min': '200px', gap: 14} as CSSProperties}><Bars m={o.match} dark /></div>
          </section>
        )}
        {action}
      </div>
      <aside className="side-col">
        <section className="card" style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '14px 16px', borderBottom: '1px solid var(--soft)', display: 'flex', gap: 10, alignItems: 'center'}}><Avatar u={other} size={38} /><b>{other.name}</b></div>
          <div style={{padding: '6px 16px 10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120}}>
            {o.msgs.length ? o.msgs.map((mm, i) => mm.from === 'sys'
              ? <span key={i} className="msg sys">{mm.text}</span>
              : <span key={i} className={'msg ' + ((mm.from === 'client') === c ? 'me' : 'them')}>{mm.text}</span>)
              : <span className="small muted">Sem mensagens.</span>}
            <span className="msg sys">Para sua segurança, combine e pague tudo pela Freela.</span>
          </div>
          {o.status !== 'rated' && (
            <form style={{display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--soft)'}} onSubmit={e => { e.preventDefault(); send(); }}>
              <label htmlFor="msgIn" className="sr">Mensagem</label>
              <input type="text" id="msgIn" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escreva uma mensagem" />
              <button className="btn" type="submit" style={{minWidth: 48, padding: 0}} aria-label="Enviar mensagem"><Icon n="send" s={18} /></button>
            </form>
          )}
        </section>
      </aside>
    </div>
  </>;
}
