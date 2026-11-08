import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { CATS, SKILLSUG } from '../data/seed';
import { brl } from '../lib/format';
import { toast, useStore, useWorld } from '../store';

/** Edição manual do perfil de prestador, com pré-visualização ao lado. */
export default function ProEdit() {
  const w = useWorld(), nav = useNavigate(), updateProfile = useStore(s => s.updateProfile), p = w.me;
  const [role, setRole] = useState(p.role), [bio, setBio] = useState(p.bio);
  const [years, setYears] = useState(String(p.years)), [price, setPrice] = useState(String(p.price));
  const [skills, setSkills] = useState(p.skills), [certs, setCerts] = useState(p.certs);
  const [newSkill, setNewSkill] = useState(''), [newCert, setNewCert] = useState('');
  const sugg = [...new Set([...SKILLSUG[p.cat], ...skills])];
  const toggle = (s: string) => setSkills(skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]);
  const addSkill = () => { const s = newSkill.trim(); if (s && !skills.includes(s)) setSkills([...skills, s]); setNewSkill(''); };
  const addCert = () => { const s = newCert.trim(); if (s && !certs.includes(s)) setCerts([...certs, s]); setNewCert(''); };
  const save = () => {
    if (!role.trim()) { toast('Informe como você se apresenta.'); return; }
    updateProfile({role: role.trim(), bio: bio.trim(), years: Math.max(0, +years || 0), price: Math.max(0, +price || 0), skills, certs});
    toast('Perfil atualizado. Os clientes já veem a nova versão.');
  };
  const preview = {...p, role, bio, price: +price || 0, skills, certs};

  return <>
    <h1 style={{fontSize: 30}}>Seu perfil de prestador</h1>
    <div className="row">
      <section className="main-col card" style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <div><span className="lbl">Categoria</span><span className="chip d">{CATS[p.cat].label}</span></div>
        <div><label className="lbl" htmlFor="role">Como você se apresenta</label><input type="text" id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="Ex.: Técnico de informática" /></div>
        <div><label className="lbl" htmlFor="bio">Sobre você</label><textarea id="bio" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Conte sua experiência e o que você faz" /></div>
        <div className="grid" style={{'--min': '160px'} as React.CSSProperties}>
          <div><label className="lbl" htmlFor="years">Anos de experiência</label><input type="number" id="years" min={0} value={years} onChange={e => setYears(e.target.value)} /></div>
          <div><label className="lbl" htmlFor="pprice">Preço a partir de (R$)</label><input type="number" id="pprice" min={0} step={10} value={price} onChange={e => setPrice(e.target.value)} /></div>
        </div>
        <div>
          <span className="lbl">Habilidades</span>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>{sugg.map(s => <button key={s} className="tog" aria-pressed={skills.includes(s)} onClick={() => toggle(s)}>{s}</button>)}</div>
          <form style={{display: 'flex', gap: 8, marginTop: 8}} onSubmit={e => { e.preventDefault(); addSkill(); }}>
            <label htmlFor="newSkill" className="sr">Nova habilidade</label>
            <input type="text" id="newSkill" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Adicionar outra habilidade" />
            <button className="btn o" type="submit">Adicionar</button>
          </form>
        </div>
        <div>
          <span className="lbl">Certificados</span>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {certs.length ? certs.map(c => <button key={c} className="chip b" style={{border: 0}} onClick={() => setCerts(certs.filter(x => x !== c))} aria-label={'Remover ' + c}>{c} ✕</button>) : <span className="small muted">Nenhum certificado.</span>}
          </div>
          <form style={{display: 'flex', gap: 8, marginTop: 8}} onSubmit={e => { e.preventDefault(); addCert(); }}>
            <label htmlFor="newCert" className="sr">Novo certificado</label>
            <input type="text" id="newCert" value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="Ex.: NR-10 — Segurança em eletricidade" />
            <button className="btn o" type="submit">Adicionar</button>
          </form>
        </div>
        <button className="btn n" onClick={save}><Icon n="check" s={18} c="#FF8A3D" w={3} />Salvar perfil</button>
      </section>
      <aside className="side-col">
        <div className="card" style={{border: '2px solid var(--navy)', display: 'flex', flexDirection: 'column', gap: 12}}>
          <span className="small muted">Como os clientes veem</span>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <Avatar u={p} size={56} />
            <span><b style={{fontSize: 17}}>{p.name}</b><br /><span className="small muted">{preview.role || '—'} · a partir de {brl(preview.price)}</span></span>
          </div>
          {bio && <p className="small" style={{lineHeight: 1.55, color: 'var(--ink2)'}}>{bio}</p>}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>{skills.map(s => <span key={s} className="chip">{s}</span>)}</div>
          {certs.map(x => <span key={x} className="chip b" style={{alignSelf: 'flex-start'}}>{x}</span>)}
          <button className="btn o w" onClick={() => nav('/perfil')}>Ver perfil completo</button>
        </div>
      </aside>
    </div>
  </>;
}
