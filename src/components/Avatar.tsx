import type { CSSProperties } from 'react';
import { CAT_IMG, PORT_BY_CAT, PORT_IMG } from '../data/images';
import { first, ini, norm } from '../lib/format';
import type { CatKey, User } from '../lib/types';

export const svgUri = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
export const COMPANY = /^(condom|escrit|hamburg|ateli|empresa|studio|padaria|loja|cl[ií]nica)/i;
const FEM_EXC = ['luca', 'joshua'];
export const guessG = (name: string) => { const f = norm(first(name)); return f.endsWith('a') && !FEM_EXC.includes(f) ? 'f' : 'm'; };
const hashStr = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const TINTS = ['#FFEDE1', '#E8EDF4', '#EAF2FF', '#FDE3CF', '#DCE6F5'];
export const tint = (s: string) => TINTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
const SKINS = ['#F2C9A9', '#E3B48F', '#C98E66', '#8C5A3C', '#6B4430', '#F5D3BA'];
const HAIRS = ['#2B1D16', '#5A3A28', '#1A1A1A', '#8A5A2B', '#C9A06A', '#3D2B1F'];
const AV_BG = ['#E6EEF9', '#FDE7D8', '#E7F1EC', '#EFEAF7', '#FFF5DD', '#ECEFF7'];
const SHIRTS = ['#0B1F3A', '#FF8A3D', '#3E7C6B', '#6C5BA8', '#2F6F9F', '#B5487A'];

/** Boneco ilustrado, gerado de forma determinística a partir do nome. */
export function boneco(name: string, g: string, cat: CatKey | null) {
  const h = hashStr(name), fem = g === 'f';
  const sk = SKINS[h % 6], hr = HAIRS[(h >>> 3) % 6], bg = AV_BG[(h >>> 6) % 6], sh = SHIRTS[(h >>> 9) % 6];
  const back = fem ? `<path d="M58 60 C58 24 142 24 142 60 L148 134 C130 142 70 142 52 134Z" fill="${hr}"/>` : '';
  const top = fem ? `<path d="M62 66 C58 30 142 30 138 66 C128 50 92 46 62 66Z" fill="${hr}"/>`
    : `<path d="M61 70 C54 24 146 24 139 70 C134 58 128 50 116 48 C104 56 84 54 70 50 C64 56 62 62 61 70Z" fill="${hr}"/>`;
  const beard = !fem && (h >>> 12) % 3 === 0 ? `<path d="M74 86 C80 114 120 114 126 86 C118 102 82 102 74 86Z" fill="${hr}" opacity=".85"/>` : '';
  let acc = '';
  if (cat === 'ele') acc = `<path d="M56 56 C56 20 144 20 144 56Z" fill="#F5C518"/><rect x="48" y="52" width="104" height="11" rx="5.5" fill="#E0A800"/><rect x="95" y="24" width="10" height="30" rx="4" fill="#E0A800"/>`;
  else if (cat === 'mon' || cat === 'ger') acc = `<path d="M60 58 C60 26 140 26 140 58Z" fill="${cat === 'mon' ? '#FF8A3D' : '#3E7C6B'}"/><path d="M118 56 h44 a6 6 0 0 1 0 10 h-44Z" fill="${cat === 'mon' ? '#E0651D' : '#2E5F52'}"/>`;
  else if (cat === 'jar') acc = `<ellipse cx="100" cy="52" rx="64" ry="12" fill="#D9B46C"/><path d="M68 52 C68 22 132 22 132 52Z" fill="#E8C987"/><rect x="68" y="42" width="64" height="8" fill="#3E7C6B"/>`;
  else if (cat === 'web' || cat === 'tec' || cat === 'aul') acc = `<g fill="none" stroke="#1D2939" stroke-width="3.5"><circle cx="86" cy="79" r="10"/><circle cx="114" cy="79" r="10"/><path d="M96 79h8"/></g>`;
  else if (cat === 'eve') acc = `<rect x="76" y="150" width="48" height="32" rx="6" fill="#1D2939"/><circle cx="100" cy="166" r="9" fill="#9FB4D3"/>`;
  else if (cat === 'lim') acc = `<path d="M60 60 C64 34 136 34 140 60 C120 52 80 52 60 60Z" fill="#FF8A3D" opacity=".9"/>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="200" height="200" fill="${bg}"/>${back}
    <path d="M40 200 C44 150 156 150 160 200Z" fill="${sh}"/><rect x="88" y="104" width="24" height="30" rx="10" fill="${sk}"/>
    <ellipse cx="100" cy="78" rx="38" ry="44" fill="${sk}"/>${top}${beard}
    <circle cx="86" cy="80" r="3.6" fill="#1D2939"/><circle cx="114" cy="80" r="3.6" fill="#1D2939"/>
    <path d="M90 99 Q100 106 110 99" stroke="#1D2939" stroke-width="3" fill="none" stroke-linecap="round"/>${acc}</svg>`;
}

const cache = new Map<string, string>();
export function bonecoUri(u: Pick<User, 'name' | 'g' | 'provider' | 'cat'>) {
  const key = `${u.name}|${u.g}|${u.provider ? u.cat : ''}`;
  if (!cache.has(key)) cache.set(key, svgUri(boneco(u.name, u.g || guessG(u.name), u.provider ? u.cat : null)));
  return cache.get(key)!;
}

export function Avatar({u, size = 48, style}: { u: Pick<User, 'name' | 'g' | 'provider' | 'cat'>; size?: number; style?: CSSProperties }) {
  const base = {'--s': size + 'px', ...style} as CSSProperties;
  if (COMPANY.test(u.name)) return <span className="av" style={{...base, background: tint(u.name)}} aria-hidden="true">{ini(u.name)}</span>;
  return <span className="av" style={base} aria-hidden="true"><img src={bonecoUri(u)} alt="" /></span>;
}

export const CatImg = ({k}: { k: CatKey }) => <img src={svgUri(CAT_IMG[k])} alt="" loading="lazy" />;
export const PortImg = ({cat, i}: { cat: CatKey; i: number }) =>
  <img src={svgUri(PORT_IMG[(PORT_BY_CAT[cat] || ['site'])[i % 3]])} alt="" loading="lazy" />;
