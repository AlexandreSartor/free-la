import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEE_FIXED, FEE_PCT } from '../data/seed';
import { brlc, first } from '../lib/format';
import { useStore, useWorld } from '../store';
import { Icon } from './Icon';

interface Step { icon: string; title: string; text: string; points: string[]; go?: [path: string, label: string] }

/** Guia da área Trabalhar: explica cada parte e leva a pessoa até ela. Pode ser fechado a qualquer momento. */
export default function ProTour() {
  const nav = useNavigate(), w = useWorld(), close = useStore(s => s.closeTour);
  const [i, setI] = useState(0);
  const me = w.me;

  const steps: Step[] = [
    {icon: 'briefcase', title: `Bem-vindo à área Trabalhar, ${first(me.name)}`,
      text: 'É a mesma conta que você usa para contratar. Aqui você oferece seus serviços, recebe pedidos e acompanha seus ganhos.',
      points: ['Use “Contratar” e “Trabalhar” no topo para trocar de área quando quiser', 'Você recebe 100% do valor combinado: a taxa de proteção é paga só por quem contrata']},
    {icon: 'user', title: '1. Monte seu perfil de prestador',
      text: 'É o que os clientes veem antes de contratar você. Um perfil completo aparece em mais buscas.',
      points: ['Diga como você se apresenta e conte sua experiência', 'Marque suas habilidades e adicione certificados', 'Defina o preço “a partir de” do seu serviço'],
      go: ['/trabalhar/perfil', 'Editar meu perfil']},
    {icon: 'cal', title: '2. Deixe sua agenda em dia',
      text: 'Clientes só conseguem agendar nos dias livres. Pedidos aceitos ocupam o dia sozinhos.',
      points: ['Toque num dia para alternar entre livre e folga', 'Ligue “Disponível agora” no Painel para receber pedidos urgentes'],
      go: ['/trabalhar/agenda', 'Abrir agenda']},
    {icon: 'search', title: '3. Encontre oportunidades',
      text: 'São pedidos publicados por clientes da região. Ver e enviar propostas é grátis.',
      points: ['Busque por palavra e filtre por cidade, distância, orçamento e data', 'A porcentagem mostra o quanto o pedido combina com você', 'Toque em “Enviar proposta” para mandar seu valor e uma mensagem'],
      go: ['/trabalhar/oportunidades', 'Ver oportunidades']},
    {icon: 'list', title: '4. Responda pedidos com o seu preço',
      text: 'Quando um cliente contrata você direto pelo perfil, o pedido aparece em “Pedidos novos para você” no Painel.',
      points: ['Informe o valor do serviço: você vê na hora quanto recebe', `O cliente paga o valor + ${FEE_PCT * 100}% + ${brlc(FEE_FIXED)} de taxa de proteção`, 'Combine os detalhes pelo chat do pedido'],
      go: ['/trabalhar/pedidos', 'Ver meus pedidos']},
    {icon: 'shield', title: '5. Receba com segurança e seja avaliado',
      text: 'O cliente paga pela Freela e o valor fica guardado até ele confirmar que o serviço ficou pronto.',
      points: ['Depois do serviço, vocês dois se avaliam', 'Boas avaliações dos dois lados criam conexões na sua rede de confiança', 'Suas notas contam para o ranking da sua categoria'],
      go: ['/perfil', 'Ver meu perfil público']}
  ];
  const s = steps[i], last = i === steps.length - 1;

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0));
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [close, steps.length]);

  const go = (path: string) => { close(); nav(path); };

  return (
    <div className="mbg" onClick={close}>
      <div className="modal tour" role="dialog" aria-modal="true" aria-labelledby="tourT" onClick={e => e.stopPropagation()}>
        <button className="pt-x" onClick={close} aria-label="Fechar guia">✕</button>
        <div className="tour-head">
          <span className="tour-ic"><Icon n={s.icon} s={28} c="#FF8A3D" /></span>
          <span className="small muted" style={{fontWeight: 600}}>Guia da área Trabalhar · {i + 1} de {steps.length}</span>
        </div>
        <div className="tour-bar" aria-hidden="true"><i style={{width: `${(i + 1) / steps.length * 100}%`}} /></div>
        <h2 id="tourT" style={{fontSize: 22, lineHeight: 1.2}}>{s.title}</h2>
        <p style={{color: 'var(--ink2)', lineHeight: 1.55}}>{s.text}</p>
        <ul className="tour-pts">{s.points.map(p => <li key={p}><Icon n="check" s={16} c="#FF8A3D" w={3} />{p}</li>)}</ul>
        {s.go && <button className="btn o tour-go" onClick={() => go(s.go![0])}>{s.go[1]}<Icon n="arrow" s={18} /></button>}
        <div className="tour-foot">
          <div className="tour-dots" role="tablist" aria-label="Etapas do guia">
            {steps.map((st, n) => <button key={n} role="tab" aria-selected={n === i} aria-label={`Etapa ${n + 1}: ${st.title}`} onClick={() => setI(n)} />)}
          </div>
          <div style={{display: 'flex', gap: 8, marginLeft: 'auto'}}>
            {i === 0 ? <button className="gx" onClick={close}>Pular guia</button> : <button className="btn o sm" onClick={() => setI(i - 1)}>Voltar</button>}
            <button className="btn n sm" onClick={() => last ? close() : setI(i + 1)}>{last ? 'Começar a trabalhar' : 'Próximo'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
