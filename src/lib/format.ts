import { FEE_FIXED, FEE_PCT, TODAY } from '../data/seed';

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const nf = (n: number) => n.toFixed(1).replace('.', ',');
export const brl = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
/** Valor com centavos, para valores de checkout. */
export const brlc = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export const clientFee = (price: number) => Math.round((price * FEE_PCT + FEE_FIXED) * 100) / 100;
export const clientTotal = (price: number) => price + clientFee(price);
export const WD = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const WDS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const wd = (d: number) => (d - 1) % 7; // 1/nov/2026 = domingo
export const fmtDay = (d: number) => d === TODAY ? 'hoje' : d === TODAY + 1 ? 'amanhã' : WD[wd(d)] + ', ' + d + '/11';
export const km = (p: { dist: number }) => p.dist === 0 ? 'Atende online' : nf(p.dist) + ' km';
export const cityOf = (hood: string) => (hood || '').split(', ')[1] || null;
export const hoodOf = (hood: string) => (hood || '').split(', ')[0];
export const first = (name: string) => name.split(' ')[0];
export const ini = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('');
export const ago = (m: number) => !m ? 'agora' : m < 60 ? 'há ' + m + ' min' : 'há ' + Math.round(m / 60) + ' h';
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const locTxt = (p: { dist: number; hood: string }) => p.dist === 0 ? 'Atende online' : `${cityOf(p.hood) || hoodOf(p.hood)} · ${nf(p.dist)} km`;
