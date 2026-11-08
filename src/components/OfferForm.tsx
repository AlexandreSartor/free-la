import { useState, type CSSProperties, type ReactNode } from 'react';
import { CATS, FEE_FIXED, FEE_PCT } from '../data/seed';
import { brl, brlc, clientFee, clientTotal } from '../lib/format';
import type { CatKey, Match } from '../lib/types';
import { Bars } from './common';
import { Icon } from './Icon';

/** Card "Preço do serviço": o profissional define o valor e vê quanto recebe (sem taxa) e quanto o cliente paga. */
export function PriceCard({value, onChange, refRange}: { value: string; onChange: (v: string) => void; refRange?: [number, number] }) {
  const n = Math.max(0, +value.replace(',', '.') || 0);
  return (
    <section className="card price-card">
      <div>
        <h2 style={{fontSize: 20}}>Preço do serviço</h2>
        <p className="small muted" style={{marginTop: 4}}>Informe quanto você deseja cobrar pelo trabalho.</p>
      </div>
      <div>
        <label className="lbl upper" htmlFor="price">Valor do serviço</label>
        <div className="pin-wrap">
          <span aria-hidden="true">R$</span>
          <input type="number" id="price" inputMode="decimal" min={0} step={10} value={value} onChange={e => onChange(e.target.value)} placeholder="0" />
        </div>
        {refRange && <p className="small muted" style={{marginTop: 6}}>Na região, esse tipo de serviço costuma custar entre {brl(refRange[0])} e {brl(refRange[1])}.</p>}
      </div>
      <div className="recv">
        <span style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <span className="small" style={{fontWeight: 600}}>Você recebe</span>
          <b>{brlc(n)}</b>
          <span className="small recv-note"><Icon n="clock" s={14} />Sem taxa para você · repasse em até 3 dias úteis</span>
        </span>
        <span className="recv-ic"><Icon n="wallet" s={24} c="#FF8A3D" /></span>
      </div>
      <div className="feeinfo">
        <Icon n="info" s={18} c="#1F6FEB" />
        <span>Uma taxa de proteção de <b>+{FEE_PCT * 100}% + {brlc(FEE_FIXED)}</b> será adicionada ao valor pago pelo contratante no checkout.
          {n > 0 && <> O contratante paga <b>{brlc(clientTotal(n))}</b> ({brlc(n)} + {brlc(clientFee(n))} de taxa).</>}</span>
      </div>
    </section>
  );
}

/** Formulário de orçamento/proposta: preço + mensagem, com referências da categoria ao lado. */
export default function OfferForm({header, cat, initialPrice, message, budget, m, submitLabel, onSubmit}: {
  header: ReactNode; cat: CatKey; initialPrice: number; message: (price: number) => string;
  budget?: [number, number] | null; m: Match | null; submitLabel: string; onSubmit: (price: number, msg: string) => void;
}) {
  const [price, setPrice] = useState(String(initialPrice));
  const [msg, setMsg] = useState<string | null>(null);
  const c = CATS[cat], n = Math.max(0, +price.replace(',', '.') || 0);
  return (
    <div className="row">
      <section className="main-col">
        {header}
        <PriceCard value={price} onChange={setPrice} refRange={c.ref} />
        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <div><label className="lbl" htmlFor="qmsg">Mensagem para o cliente</label>
            <textarea id="qmsg" rows={4} value={msg ?? message(n)} onChange={e => setMsg(e.target.value)} />
            <p className="small muted" style={{marginTop: 6}}>{msg === null ? 'A mensagem acompanha o valor digitado. Edite à vontade antes de enviar.' : 'Mensagem editada por você.'}</p>
          </div>
          <button className="btn n" disabled={n <= 0} onClick={() => onSubmit(n, (msg ?? message(n)).trim() || 'Orçamento enviado.')}>{submitLabel}</button>
        </div>
      </section>
      <aside className="side-col">
        <div className="dark" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <span className="small" style={{color: 'var(--or)', fontWeight: 700}}>Referências de {c.label.toLowerCase()}</span>
          <div className="grid" style={{'--min': '120px'} as CSSProperties}>
            {budget !== undefined && <div className="stat"><b>{budget ? brl(budget[0]) + '–' + brl(budget[1]) : 'Aberto'}</b><span>orçamento do cliente</span></div>}
            <div className="stat"><b>{brl(c.ref[0])}–{brl(c.ref[1])}</b><span>preço na região</span></div>
            <div className="stat"><b>{c.time}</b><span>tempo estimado</span></div>
          </div>
          <p className="small" style={{color: '#E1E7F0', lineHeight: 1.5}}>{c.tip}</p>
          {m && <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><b>Compatibilidade</b><span style={{fontFamily: "'Space Grotesk',Inter,sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--or)'}}>{m.pct}%</span></div>
            <Bars m={m} dark />
          </>}
        </div>
      </aside>
    </div>
  );
}

/** Resumo do checkout para quem contrata: serviço + taxa de proteção = total. */
export function FeeBreakdown({price, dark}: { price: number; dark?: boolean }) {
  const line = (a: ReactNode, b: string, strong?: boolean) => (
    <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: strong ? 16 : 14, fontWeight: strong ? 700 : 400}}>
      <span style={{color: strong ? undefined : dark ? '#E1E7F0' : 'var(--ink2)'}}>{a}</span><span style={{whiteSpace: 'nowrap'}}>{b}</span>
    </div>
  );
  return (
    <div className={'fee-box' + (dark ? ' dark-box' : '')}>
      {line('Valor do serviço', brlc(price))}
      {line(<>Taxa de proteção ({FEE_PCT * 100}% + {brlc(FEE_FIXED)})</>, brlc(clientFee(price)))}
      <div className="fee-sep" />
      {line('Total', brlc(clientTotal(price)), true)}
    </div>
  );
}
