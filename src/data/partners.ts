import type { CatKey } from '../lib/types';

export interface Partner { id: string; name: string; short: string; cat: string; city: string; svc: CatKey | null; color: string; desc: string; logo: string }
export const PARTNERS: Partner[] = [
  {id:'casaforte', name:'Casa Forte Materiais de Construção', short:'Casa Forte', cat:'Materiais de construção', city:'Criciúma', svc:'ger', color:'#E8692A',
    desc:'Materiais de construção, ferramentas e tudo para reformas, do cimento ao acabamento.',
    logo:`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0B1F3A"/><path d="M14 33 32 17l18 16v15H14z" fill="#E8692A"/><path d="M27 48V37h10v11" fill="#0B1F3A"/><rect x="20" y="25" width="4" height="6" fill="#FFD27A"/></svg>`,},
  {id:'techsul', name:'TechSul Informática', short:'TechSul', cat:'Informática e assistência técnica', city:'Criciúma', svc:'tec', color:'#2F6FEB',
    desc:'Computadores, acessórios e assistência técnica para casa e para pequenas empresas.',
    logo:`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0B1F3A"/><rect x="18" y="18" width="28" height="28" rx="6" fill="#2F6FEB"/><rect x="25" y="25" width="14" height="14" rx="3" fill="#9CC2FF"/><path d="M24 12v6M32 12v6M40 12v6M24 46v6M32 46v6M40 46v6M12 24h6M12 32h6M12 40h6M46 24h6M46 32h6M46 40h6" stroke="#9CC2FF" stroke-width="3" stroke-linecap="round"/></svg>`,},
  {id:'moveis', name:'Móveis & Cia', short:'Móveis & Cia', cat:'Móveis e decoração', city:'Içara', svc:'mon', color:'#2F8F7A',
    desc:'Móveis, decoração e utilidades para casa, com entrega na região carbonífera.',
    logo:`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0B1F3A"/><path d="M16 30a6 6 0 0 1 12 0v4h8v-4a6 6 0 0 1 12 0v12H16z" fill="#2F8F7A"/><rect x="16" y="40" width="32" height="6" rx="3" fill="#7FD1BC"/><path d="M20 46v5M44 46v5" stroke="#7FD1BC" stroke-width="3" stroke-linecap="round"/></svg>`,},
  {id:'credimais', name:'CrediMais', short:'CrediMais', cat:'Soluções financeiras', city:'Criciúma', svc:null, color:'#6C5BA8',
    desc:'Conta digital, maquininha e crédito para pequenos empreendedores e profissionais autônomos.',
    logo:`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0B1F3A"/><circle cx="28" cy="32" r="14" fill="none" stroke="#B9A9F2" stroke-width="6"/><path d="M42 26v12M36 32h12" stroke="#FF8A3D" stroke-width="5" stroke-linecap="round"/></svg>`,}
];
