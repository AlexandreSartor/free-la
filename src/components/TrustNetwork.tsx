import { useLayoutEffect, useRef, useState, type PointerEvent as RPE } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATS } from '../data/seed';
import { first, ini, nf } from '../lib/format';
import type { Person } from '../lib/types';
import { common, edgeInfo, links, relWord, type LevelNode, type World } from '../lib/world';
import { useWorld } from '../store';
import { bonecoUri, COMPANY, tint } from './Avatar';

interface Model { lvl: Record<string, number>; par: Record<string, string>; kids: Record<string, LevelNode[]>; chain: (x: string) => string[] }

function netModel(w: World, id: string, lv: LevelNode[][], maxL: number): Model {
  const lvl: Record<string, number> = {[id]: 0}, par: Record<string, string> = {}, kids: Record<string, LevelNode[]> = {};
  for (let l = 1; l <= maxL; l++) lv[l].forEach(n => {
    const pv = l === 1 ? id : n.via.find(v => lvl[v] === l - 1);
    if (!pv) return;
    lvl[n.id] = l; par[n.id] = pv; (kids[pv] = kids[pv] || []).push(n);
  });
  const size = (x: string): number => (kids[x] || []).reduce((a, c) => a + size(c.id), 1);
  Object.values(kids).forEach(a => a.sort((p, q) => size(q.id) - size(p.id) || w.byId[p.id].name.localeCompare(w.byId[q.id].name, 'pt')));
  const chain = (x: string) => { const c = [x]; while (par[x]) { x = par[x]; c.unshift(x); } return c; };
  return {lvl, par, kids, chain};
}

const shortName = (u: Person) => COMPANY.test(u.name) ? (u.name.length > 16 ? u.name.slice(0, 15) + '…' : u.name)
  : (u.name.split(' ').length > 1 ? first(u.name) + ' ' + u.name.split(' ').slice(-1)[0][0] + '.' : u.name);
const repTxt = (u: Person) => u.count ? '★ ' + nf(u.rating) : u.ccount ? '★ ' + nf(u.crating) : 'novo';

function NodeImg({u, x, y, r}: { u: Person; x: number; y: number; r: number }) {
  if (COMPANY.test(u.name)) return <>
    <circle cx={x} cy={y} r={r} fill={tint(u.name)} />
    <text x={x} y={y + r * .32} textAnchor="middle" fontSize={Math.round(r * .8)} fontWeight={700} fill="#0B1F3A">{ini(u.name)}</text>
  </>;
  return <image href={bonecoUri(u)} x={x - r} y={y - r} width={2 * r} height={2 * r} clipPath="url(#nc)" />;
}

const G: Record<number, { w: number; h: number; r: number }> = {1: {w: 190, h: 52, r: 19}, 2: {w: 170, h: 44, r: 16}, 3: {w: 152, h: 38, r: 13}};
const X: Record<number, number> = {0: 16, 1: 300, 2: 560, 3: 800};
const RW = 220, RH = 80;
const ST: Record<number, Record<string, string | number>> = {
  1: {stroke: '#FF8A3D', strokeWidth: 2.6},
  2: {stroke: '#34507E', strokeWidth: 1.8, strokeDasharray: '7 6'},
  3: {stroke: '#8A97AB', strokeWidth: 1.8, strokeDasharray: '0.5 5', strokeLinecap: 'round'}
};
const f1 = (v: number) => +v.toFixed(1);

function Tip({w, rootId, x, M, touch}: { w: World; rootId: string; x: string; M: Model; touch: boolean }) {
  const u = w.byId[x], p = w.byId[M.par[x]], l = M.lvl[x], e = edgeInfo(w, M.par[x], x), cm = w.meId !== x ? common(w, w.meId, x).length : 0;
  return <>
    <b>{u.name}</b>
    <span className={'lv lv' + l}>{l === 1 ? 'Nível 1 · experiência direta' : 'Nível ' + l + ' · indireta'}</span>
    {l > 1 && <span>Via <b>{first(p.name)}</b>. Não é indicação pessoal de {first(w.byId[rootId].name)}.</span>}
    {e && <span>{relWord(e.s.role, first(p.name), first(u.name))} · {CATS[e.s.o.cat].label} · {e.s.o.date} · {e.s.o.ratePro!.stars}★ e {e.s.o.rateClient!.stars}★</span>}
    <span className="muted">
      {u.count ? `Prestador ★ ${nf(u.rating)} (${u.count})` : ''}{u.count && u.ccount ? ' · ' : ''}{u.ccount ? `Contratante ★ ${nf(u.crating)} (${u.ccount})` : ''}{!u.count && !u.ccount ? 'Novo na Freela' : ''} · {links(w, x).length} conexões
    </span>
    {u.id === w.meId ? <span style={{color: '#C2410C'}}><b>Este é você</b></span> : cm ? <span style={{color: '#1F6FEB'}}>{cm} {cm === 1 ? 'conexão' : 'conexões'} em comum com você</span> : null}
    <em>{touch ? 'Toque de novo para abrir o perfil' : 'Clique para abrir o perfil'}</em>
  </>;
}

function NetTree({id, lv, maxL, M}: { id: string; lv: LevelNode[][]; maxL: number; M: Model }) {
  const w = useWorld(), nav = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null), boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ id: string; left: number; top: number } | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const drag = useRef({down: false, moved: false, x: 0, y: 0, sl: 0, st: 0});
  const [dragging, setDragging] = useState(false);
  /** Último ponteiro foi um dedo: no toque não existe "passar o mouse", então o 1º toque mostra a dica e o 2º abre o perfil. */
  const touch = useRef(false);
  const noHover = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  // Layout: cada folha ocupa uma linha; pais ficam centralizados nos filhos.
  const pos: Record<string, number> = {}; let cur = 18;
  const place = (x: string, l: number): number => {
    const ch = l < maxL ? (M.kids[x] || []) : [];
    if (!ch.length) { const h = l === 0 ? RH + 20 : G[l].h + 14; pos[x] = cur + h / 2; cur += h; return pos[x]; }
    const ys = ch.map(c => place(c.id, l + 1));
    return pos[x] = (ys[0] + ys[ys.length - 1]) / 2;
  };
  place(id, 0);
  const H = Math.max(cur + 18, RH + 40), W = X[maxL] + G[maxL].w + 70, root = w.byId[id];
  const nodes = Object.keys(pos).filter(x => x !== id), myL1 = new Set(links(w, w.meId).map(e => e.id));
  const chain = hover ? new Set(M.chain(hover.id)) : null;
  const on = (x: string) => !chain || chain.has(x) ? 'on' : '';

  const show = (x: string, el: Element) => {
    const box = boxRef.current; if (!box) return;
    const o = box.getBoundingClientRect(), r = el.getBoundingClientRect(), tw = 270, th = 150;
    let left = r.right - o.left + 10, top = r.top - o.top - 6;
    if (left + tw > o.width) left = r.left - o.left - tw - 10;
    if (left < 0) left = Math.max(0, Math.min(o.width - tw, r.left - o.left));
    if (top + th > o.height - 30) top = Math.max(0, o.height - 30 - th);
    setHover({id: x, left, top: Math.max(0, top)});
  };
  const zoom = (n: number) => {
    const wrap = wrapRef.current; if (!wrap) return;
    if (n === 0) { setWidth(wrap.clientWidth < 700 ? Math.round(W * .78) : null); wrap.scrollTo({left: 0, top: 0, behavior: 'smooth'}); return; }
    const svg = wrap.querySelector('svg')!, curW = svg.getBoundingClientRect().width;
    setWidth(Math.max(wrap.clientWidth * .5, Math.min(W * 2.2, curW * (n > 0 ? 1.25 : .8))));
  };
  const onDown = (e: RPE) => { touch.current = e.pointerType === 'touch'; const wr = wrapRef.current; if (!wr || touch.current || e.button !== 0) return; drag.current = {down: true, moved: false, x: e.clientX, y: e.clientY, sl: wr.scrollLeft, st: wr.scrollTop}; };
  const onMove = (e: RPE) => {
    const d = drag.current, wr = wrapRef.current; if (!d.down || !wr) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 5 && !d.moved) { d.moved = true; setDragging(true); }
    if (d.moved) { wr.scrollLeft = d.sl - dx; wr.scrollTop = d.st - dy; }
  };
  const onUp = () => { drag.current.down = false; setDragging(false); setTimeout(() => { drag.current.moved = false; }, 0); };
  const open = (x: string, el: Element) => {
    if (drag.current.moved) return;
    if (touch.current && hover?.id !== x) { show(x, el); return; }
    nav('/perfil/' + x);
  };

  // Em telas estreitas, começa com um zoom legível e deixa a árvore rolar para o lado.
  useLayoutEffect(() => {
    const wr = wrapRef.current; if (!wr) return;
    setHover(null);
    setWidth(wr.clientWidth < 700 ? Math.round(W * .78) : null);
  }, [W]);

  const ry = pos[id] - RH / 2;
  return <>
    <div className="nzoom" role="group" aria-label="Zoom da árvore" style={{alignSelf: 'flex-end'}}>
      <button onClick={() => zoom(-1)} aria-label="Diminuir zoom">−</button>
      <button onClick={() => zoom(1)} aria-label="Aumentar zoom">+</button>
      <button onClick={() => zoom(0)}>Centralizar</button>
    </div>
    <div className="ntree" ref={boxRef}>
      <div className={'netwrap' + (dragging ? ' drag' : '')} ref={wrapRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <svg viewBox={`0 0 ${W} ${f1(H)}`} className={chain ? 'hl' : ''} style={width ? {width, maxWidth: 'none'} : {width: '100%', maxWidth: W}} role="group" aria-label={'Árvore da rede de confiança de ' + root.name}
          onClick={e => { if (!(e.target as Element).closest('.nd')) setHover(null); }}>
          <defs><clipPath id="nc" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5" /></clipPath></defs>
          {nodes.map(x => {
            const l = M.lvl[x], p = M.par[x], lp = l - 1, x1 = X[lp] + (lp === 0 ? RW : G[lp].w), y1 = pos[p], x2 = X[l], y2 = pos[x], dx = (x2 - x1) * .55;
            return <path key={'e' + x} className={`ed l${l} ${on(x)}`} d={`M${f1(x1)} ${f1(y1)} C${f1(x1 + dx)} ${f1(y1)} ${f1(x2 - dx)} ${f1(y2)} ${f1(x2)} ${f1(y2)}`} fill="none" {...ST[l]} style={{'--d': l * 140 + 'ms'} as React.CSSProperties} />;
          })}
          {nodes.filter(x => M.lvl[x] === 1).map(x => {
            const e = edgeInfo(w, id, x)!, t = e.roles.size > 1 ? 'contratou e prestou' : e.roles.has('contratou') ? 'contratou' : 'prestou serviço';
            return <text key={'l' + x} className={'elb ' + on(x)} x={f1(X[1] - 10)} y={f1(pos[x] - 8)} textAnchor="end">{t}{e.n > 1 ? ' · ' + e.n + 'x' : ''}</text>;
          })}
          <g className="nd root" transform={`translate(${X[0]} ${f1(ry)})`}>
            <g className="ndi" style={{'--d': '0ms'} as React.CSSProperties}>
              <rect width={RW} height={RH} rx={22} fill="#0B1F3A" /><circle cx={42} cy={RH / 2} r={29} fill="#FF8A3D" /><NodeImg u={root} x={42} y={RH / 2} r={26} />
              <text x={82} y={RH / 2 - 6} className="rnm">{id === w.meId ? 'Você' : shortName(root)}</text>
              <text x={82} y={RH / 2 + 13} className="rmt">{lv[1].length} diretas · {lv[2].length + lv[3].length} indiretas</text>
            </g>
          </g>
          {nodes.map((x, i) => {
            const l = M.lvl[x], u = w.byId[x], g = G[l], me = x === w.meId, cm = !me && id !== w.meId && myL1.has(x), p = w.byId[M.par[x]];
            const meta = l === 1 ? `${repTxt(u)} · ${links(w, x).length} conexões` : `via ${first(p.name)} · ${repTxt(u)}`;
            return (
              <g key={'n' + x} className={`nd l${l}${me ? ' me' : ''}${cm ? ' cm' : ''} ${on(x)}`} transform={`translate(${X[l]} ${f1(pos[x] - g.h / 2)})`} tabIndex={0} role="button"
                aria-label={`${u.name}, ${l === 1 ? 'experiência direta' : 'conexão indireta de nível ' + l + ' via ' + first(p.name)}`}
                onMouseEnter={e => { if (!touch.current) show(x, e.currentTarget); }} onMouseLeave={() => { if (!touch.current) setHover(null); }}
                onFocus={e => { if (!touch.current) show(x, e.currentTarget); }} onBlur={() => { if (!touch.current) setHover(null); }}
                onClick={e => open(x, e.currentTarget)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav('/perfil/' + x); } }}>
                <g className="ndi" style={{'--d': l * 140 + 60 + Math.min(i, 20) * 12 + 'ms'} as React.CSSProperties}>
                  <rect className="pill" width={g.w} height={g.h} rx={g.h / 2} /><NodeImg u={u} x={g.h / 2} y={g.h / 2} r={g.r} />
                  <text className="nm" x={g.h + 2} y={f1(g.h / 2 - 2)}>{me ? 'Você' : shortName(u)}</text>
                  <text className="mt" x={g.h + 2} y={f1(g.h / 2 + 11)}>{meta}</text>
                  {cm && <g transform={`translate(${g.w - 64} -9)`}><rect width={62} height={17} rx={8.5} fill="#EAF2FF" stroke="#1F6FEB" /><text x={31} y={12} textAnchor="middle" className="cmt">em comum</text></g>}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      {hover && <div className="ntip" style={{left: hover.left, top: hover.top}}><Tip w={w} rootId={id} x={hover.id} M={M} touch={touch.current} /></div>}
      <p className="small muted">{noHover
        ? <>Toque numa pessoa para ver como ela se liga a {first(root.name)}; toque de novo para abrir o perfil. Arraste com o dedo para mover a árvore.</>
        : <>Passe o mouse sobre uma pessoa para ver como ela se liga a {first(root.name)}. Clique para abrir o perfil. Arraste para mover a árvore.</>}</p>
    </div>
  </>;
}

export default function TrustNetwork({id, lv, maxL, setMaxL}: { id: string; lv: LevelNode[][]; maxL: number; setMaxL: (n: number) => void }) {
  const w = useWorld(), M = netModel(w, id, lv, maxL);
  const Leg = ({st, t, n}: { st: Record<string, string | number>; t: string; n: number }) =>
    <span className="lg"><svg width="34" height="10" aria-hidden="true"><path d="M2 5h30" {...st} /></svg>{t}<b>{n}</b></span>;
  return <>
    <div className="ntools">
      <div className="ctrls" role="group" aria-label="Níveis visíveis">
        {([[1, 'Só diretas'], [2, 'Até nível 2'], [3, 'Até nível 3']] as [number, string][]).map(([n, t]) =>
          <button key={n} className="tog" aria-pressed={maxL === n} onClick={() => setMaxL(n)}>{t}</button>)}
      </div>
    </div>
    <div className="nlegend">
      <Leg st={{stroke: '#FF8A3D', strokeWidth: 3}} t="Nível 1 · experiência direta" n={lv[1].length} />
      {maxL >= 2 && <Leg st={{stroke: '#34507E', strokeWidth: 2, strokeDasharray: '6 5'}} t="Nível 2 · indireta" n={lv[2].length} />}
      {maxL >= 3 && <Leg st={{stroke: '#8A97AB', strokeWidth: 2.4, strokeDasharray: '0.5 5', strokeLinecap: 'round'}} t="Nível 3 · mais distante" n={lv[3].length} />}
      {id !== w.meId && <span className="lg"><span className="cmchip">em comum</span>conexão em comum com você</span>}
    </div>
    <NetTree id={id} lv={lv} maxL={maxL} M={M} />
  </>;
}
