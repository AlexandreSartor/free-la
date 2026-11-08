import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PARTNERS, type Partner } from '../data/partners';
import casaforte from '../assets/partners/casaforte.jpg';
import credimais from '../assets/partners/credimais.jpg';
import moveis from '../assets/partners/moveis.jpg';
import techsul from '../assets/partners/techsul.jpg';
import { CATS } from '../data/seed';
import { toast, useStore } from '../store';

const STEPS: [string, string, string][] = [
  ['handshake', 'Fale com a equipe', 'Conte sobre o seu negócio e combinamos como sua marca aparece na Freela.'],
  ['store', 'Monte a vitrine da sua empresa', 'Logo, foto e descrição do seu negócio na página de Parceiros.'],
  ['users', 'Alcance a comunidade', 'Sua loja aparece nas categorias certas, para quem está contratando ou trabalhando.']
];

/** Fotos reais de fachadas (Unsplash, licença livre) que ilustram cada parceiro. */
const PHOTOS: Record<string, string> = {casaforte, techsul, moveis, credimais};
const Photo = ({p}: { p: Partner }) => <img src={PHOTOS[p.id]} alt={p.cat} loading="lazy" />;
const Logo = ({p, size = 58, style}: { p: Partner; size?: number; style?: CSSProperties }) =>
  <span className="plogo" style={{width: size, height: size, ...style}} dangerouslySetInnerHTML={{__html: p.logo}} />;

function Modal({children, onClose, wide}: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="mbg" onClick={onClose}>
      <div className="modal" style={wide ? {maxWidth: 720} : undefined} role="dialog" aria-modal="true" aria-labelledby="mdT" onClick={e => e.stopPropagation()}>
        <button className="pt-x" onClick={onClose} aria-label="Fechar">✕</button>
        {children}
      </div>
    </div>
  );
}

function JoinForm({onClose}: { onClose: () => void }) {
  const addLead = useStore(s => s.addLead);
  const [name, setName] = useState(''), [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!name.trim()) { toast('Informe o nome da empresa.'); document.getElementById('pjName')?.focus(); return; }
    if (!contact.trim()) { toast('Informe um e-mail ou telefone para contato.'); document.getElementById('pjContact')?.focus(); return; }
    addLead({name: name.trim(), contact: contact.trim()});
    setSent(true);
  };
  if (sent) return (
    <div className="pt-done">
      <span className="pt-done-ic"><Icon n="check" s={30} c="#fff" w={3} /></span>
      <h2 id="mdT" style={{fontSize: 24}}>Interesse registrado!</h2>
      <p className="muted" style={{lineHeight: 1.55}}>Obrigado, {name.trim()}. Nossa equipe entra em contato por <b style={{color: 'var(--navy)'}}>{contact.trim()}</b> para conversar sobre a parceria.</p>
      <button className="btn n" onClick={onClose}>Fechar</button>
    </div>
  );
  return <>
    <span className="chip o" style={{alignSelf: 'flex-start'}}><Icon n="handshake" s={14} />Parcerias comerciais</span>
    <h2 id="mdT" style={{fontSize: 24}}>Seja um parceiro da Freela</h2>
    <p className="small muted" style={{lineHeight: 1.55}}>Sua marca aparece para quem contrata e para quem presta serviços em Criciúma e região. Deixe seu contato e nossa equipe retorna.</p>
    <div className="grid" style={{'--min': '200px'} as CSSProperties}>
      <div><label className="lbl" htmlFor="pjName">Nome da empresa</label><input type="text" id="pjName" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Ferragens Içara" /></div>
      <div><label className="lbl" htmlFor="pjContact">E-mail ou telefone</label><input type="text" id="pjContact" value={contact} onChange={e => setContact(e.target.value)} placeholder="contato@empresa.com.br" /></div>
    </div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end'}}>
      <button className="btn o" onClick={onClose}>Cancelar</button>
      <button className="btn n" onClick={submit}>Enviar interesse</button>
    </div>
  </>;
}

function PartnerDetail({p, onClose}: { p: Partner; onClose: () => void }) {
  const nav = useNavigate(), resetSf = useStore(s => s.resetSf);
  return <>
    <div className="mban"><Photo p={p} /><span className="pseal"><Icon n="check" s={13} c="#fff" w={3} />Parceiro Freela</span></div>
    <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <Logo p={p} style={{margin: 0}} />
      <span><h2 id="mdT" style={{fontSize: 22}}>{p.name}</h2><span className="small muted">{p.cat} · {p.city}</span></span>
    </div>
    <p style={{lineHeight: 1.55, color: 'var(--ink2)'}}>{p.desc}</p>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end'}}>
      <button className="btn o" onClick={onClose}>Fechar</button>
      <button className="btn n" onClick={() => { resetSf(p.svc ? {cat: p.svc} : undefined); nav('/buscar'); }}>
        {p.svc ? `Ver profissionais de ${CATS[p.svc].label.toLowerCase()}` : 'Ver profissionais da região'}<Icon n="arrow" s={18} />
      </button>
    </div>
  </>;
}

export default function Partners() {
  const [detail, setDetail] = useState<string | null>(null);
  const [join, setJoin] = useState(false);
  const [feat, ...rest] = PARTNERS;
  const detailP = PARTNERS.find(x => x.id === detail);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});

  return <>
    <section className="pt-hero">
      <div className="pt-hero-txt">
        <span className="chip" style={{alignSelf: 'flex-start', background: 'rgba(255,255,255,.12)', color: '#fff'}}><Icon n="award" s={14} c="#FF8A3D" />Parceiros Freela</span>
        <h1>Empresas da região que <span style={{color: 'var(--or)'}}>fortalecem</span> quem trabalha aqui</h1>
        <p>Lojas de materiais, informática, móveis e serviços financeiros que apoiam os profissionais e os serviços de Criciúma e região.</p>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
          <button className="btn" onClick={() => scrollTo('pt-list')}>Conhecer parceiros</button>
          <button className="btn pt-ghost" onClick={() => setJoin(true)}>Quero ser parceiro</button>
        </div>
      </div>
      <div className="phero-logos" aria-hidden="true">{PARTNERS.map(x => <span key={x.id} dangerouslySetInnerHTML={{__html: x.logo}} />)}</div>
    </section>

    <section id="pt-list" style={{display: 'flex', flexDirection: 'column', gap: 16, scrollMarginTop: 80}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between'}}>
        <h2 style={{fontSize: 22}}>Nossos parceiros</h2>
      </div>

      {feat && (
        <article className="pt-feat">
          <div className="pt-feat-ban"><Photo p={feat} /><span className="pseal"><Icon n="star" s={13} c="#FFD27A" w={2.4} />Parceiro em destaque</span></div>
          <div className="pt-feat-body">
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              <Logo p={feat} size={52} style={{margin: 0}} />
              <span>
                <span className="pcat" style={{color: feat.color}}>{feat.cat}</span>
                <h3 style={{fontSize: 22, lineHeight: 1.2}}>{feat.name}</h3>
              </span>
            </div>
            <span className="pt-meta"><span><Icon n="pin" s={14} />{feat.city}</span></span>
            <p style={{color: 'var(--ink2)', lineHeight: 1.55}}>{feat.desc}</p>
            <div style={{marginTop: 'auto'}}><button className="btn n" onClick={() => setDetail(feat.id)}>Conhecer parceiro<Icon n="arrow" s={18} /></button></div>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div className="pt-grid">
          {rest.map(x => (
            <article key={x.id} className="partner pt-card" style={{'--pc': x.color} as CSSProperties}>
              <div className="pban"><Photo p={x} /><span className="pseal"><Icon n="check" s={13} c="#fff" w={3} />Parceiro</span></div>
              <div className="pbody">
                <Logo p={x} />
                <span className="pcat" style={{color: x.color}}>{x.cat}</span>
                <h3 style={{fontSize: 18, lineHeight: 1.2}}>{x.name}</h3>
                <span className="pt-meta"><span><Icon n="pin" s={14} />{x.city}</span></span>
                <p className="small" style={{color: 'var(--ink2)', lineHeight: 1.5}}>{x.desc}</p>
                <button className="btn o w" style={{marginTop: 'auto'}} onClick={() => setDetail(x.id)}>Conhecer parceiro</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <section className="pt-how">
      <h2 style={{fontSize: 22}}>Como funciona a parceria</h2>
      <div className="pt-grid" style={{'--min': '220px'} as CSSProperties}>
        {STEPS.map(([ic, t, d], i) => (
          <div key={t} className="pt-step">
            <span className="pt-step-n">{i + 1}</span>
            <span className="pt-step-ic"><Icon n={ic} s={22} c="#FF8A3D" /></span>
            <b>{t}</b>
            <p className="small muted" style={{lineHeight: 1.5}}>{d}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="pcta">
      <span className="pt-step-ic" style={{background: 'var(--navy2)'}}><Icon n="mail" s={22} c="#FF8A3D" /></span>
      <span style={{flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 6}}>
        <h2 style={{fontSize: 20}}>Quer ser um parceiro da Freela?</h2>
        <span style={{color: 'var(--pale)', lineHeight: 1.5}}>Deixe seu contato e nossa equipe monta uma proposta para o seu negócio.</span>
      </span>
      <button className="btn" onClick={() => setJoin(true)}>Falar com a equipe</button>
    </section>
    
    {join && <Modal onClose={() => setJoin(false)}><JoinForm onClose={() => setJoin(false)} /></Modal>}
    {detailP && <Modal wide onClose={() => setDetail(null)}><PartnerDetail p={detailP} onClose={() => setDetail(null)} /></Modal>}
  </>;
}
