/* Regras do negócio. Tudo é calculado a partir do estado (pessoas, pedidos e oportunidades). */
import { CATS, TODAY } from '../data/seed';
import type { CatKey, Job, Match, OppFilters, Order, Person, Reason, SearchFilters, User } from './types';
import { cityOf, fmtDay, hoodOf, km, nf, brl } from './format';
import { SYNONYMS, textSearch } from './search';

/** Nota mínima, dos dois lados, para uma experiência virar conexão de confiança. */
export const POS = 4;

export interface Svc { o: Order; role: 'contratou' | 'prestou' }
export interface Edge { id: string; svc: Svc[] }
export type Net = Record<string, Record<string, Edge>>;
export interface LevelNode { id: string; via: string[] }

export interface World {
  meId: string;
  me: Person;
  people: Person[];
  byId: Record<string, Person>;
  orders: Order[];
  jobs: Job[];
  net: Net;
}

export function buildWorld(s: { users: User[]; orders: Order[]; jobs: Job[]; meId: string }): World {
  const done = s.orders.filter(o => o.status === 'rated' && o.ratePro && o.rateClient);
  const by: Record<string, { pr: number[]; cl: number[] }> = {};
  s.users.forEach(u => by[u.id] = {pr: [], cl: []});
  done.forEach(o => { by[o.proId]?.pr.push(o.ratePro!.stars); by[o.clientId]?.cl.push(o.rateClient!.stars); });
  const avg = (a: number[]) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : 0;
  const people: Person[] = s.users.map(u => {
    const b = by[u.id];
    return {...u, rating: avg(b.pr), count: b.pr.length, jobs: b.pr.length, crating: avg(b.cl), ccount: b.cl.length};
  });
  const byId: Record<string, Person> = {};
  people.forEach(p => byId[p.id] = p);
  const net: Net = {};
  done.forEach(o => {
    if (o.ratePro!.stars < POS || o.rateClient!.stars < POS) return; // experiência negativa fica no histórico, mas não vira conexão
    const add = (a: string, b: string, role: Svc['role']) => {
      net[a] = net[a] || {};
      const e = net[a][b] = net[a][b] || {id: b, svc: []};
      e.svc.push({o, role});
    };
    add(o.clientId, o.proId, 'contratou'); add(o.proId, o.clientId, 'prestou');
  });
  return {meId: s.meId, me: byId[s.meId], people, byId, orders: s.orders, jobs: s.jobs, net};
}

export const doneOrders = (w: World) => w.orders.filter(o => o.status === 'rated' && o.ratePro && o.rateClient);
export const provs = (w: World) => w.people.filter(p => p.provider);
export const cRate = (u?: Person) => u && u.ccount ? u.crating : null;
export const cTxt = (u: Person) => cRate(u) ? 'cliente nota ' + nf(cRate(u)!) : 'cliente novo na Freela';
export const rTxt = (p: Person) => p.count ? nf(p.rating) : 'Novo';
export const relWord = (role: Svc['role'], a: string, b: string) => role === 'contratou' ? `${a} contratou ${b}` : `${a} prestou serviço para ${b}`;

export function dayState(w: World, p: User, d: number): 'past' | 'busy' | 'free' | 'off' {
  if (d < TODAY) return 'past';
  if (w.orders.some(o => o.proId === p.id && o.day === d && ['accepted', 'paid'].includes(o.status))) return 'busy';
  if (p.busy.includes(d)) return 'busy';
  if (p.agenda[d]) return p.agenda[d];
  return (d - 1) % 7 === 0 ? 'off' : 'free';
}
export const freeDays = (w: World, p: User, max = 99) => {
  const a: number[] = [];
  for (let d = TODAY; d <= 30 && a.length < max; d++) if (dayState(w, p, d) === 'free') a.push(d);
  return a;
};

export interface MatchCtx { cat?: CatKey | null; day?: number | null; urgent?: boolean }
export function match(w: World, p: Person, q?: MatchCtx): Match {
  const r: Reason[] = [];
  const skill = !q || !q.cat || p.cat === q.cat ? 100 : 0;
  r.push(['Habilidade', skill ? 'Faz esse tipo de serviço' : 'Outra área', skill]);
  let ag = 90, agt = 'Agenda com dias livres';
  if (q && q.urgent) { ag = p.now ? 100 : 30; agt = p.now ? 'Disponível agora' : 'Indisponível hoje'; }
  else if (q && q.day) { const st = dayState(w, p, q.day); ag = st === 'free' ? 100 : 25; agt = (st === 'free' ? 'Livre ' : 'Ocupado ') + fmtDay(q.day); }
  r.push(['Agenda', agt, ag]);
  const dist = p.dist === 0 ? 100 : Math.max(20, Math.round(100 - p.dist * 4));
  r.push(['Distância', km(p), dist]);
  const rat = p.count ? Math.round(p.rating / 5 * 100) : 70; // perfil novo: neutro
  r.push(['Avaliações', p.count ? 'Nota ' + nf(p.rating) + ' (' + p.count + ')' : 'Novo na Freela, ainda sem avaliações', rat]);
  const ref = CATS[p.cat].ref, mid = (ref[0] + ref[1]) / 2;
  const pr = p.price <= mid ? 100 : p.price <= ref[1] ? 85 : 60;
  r.push(['Preço', 'A partir de ' + brl(p.price), pr]);
  return {pct: Math.round(skill * .3 + ag * .25 + dist * .15 + rat * .2 + pr * .1), reasons: r};
}

export const jobDist = (p: User, j: Job) => j.pub || j.dist == null ? p.dist : j.dist;
export function matchJob(w: World, p: Person, j: Job): Match {
  const r: Reason[] = [];
  const skill = p.cat === j.cat ? 100 : 0;
  r.push(['Habilidade', skill ? 'Faz esse tipo de serviço' : 'Outra área', skill]);
  const jd = jobDist(p, j);
  const dist = jd === 0 ? (CATS[j.cat].remote ? 100 : 60) : Math.max(20, Math.round(100 - jd * 4));
  r.push(['Distância', jd === 0 ? 'Serviço online' : nf(jd) + ' km', dist]);
  const st = dayState(w, p, j.day);
  const ag = j.urgent ? (p.now ? 100 : 30) : (st === 'free' ? 100 : 25);
  r.push(['Agenda', j.urgent ? (p.now ? 'Disponível agora' : 'Indisponível agora') : (st === 'free' ? 'Livre ' : 'Ocupado ') + fmtDay(j.day), ag]);
  const bud = j.budget ? (p.price <= j.budget[1] ? 100 : p.price <= j.budget[1] * 1.3 ? 60 : 30) : 80;
  r.push(['Orçamento', j.budget ? 'Cliente paga até ' + brl(j.budget[1]) : 'A combinar', bud]);
  const cr = cRate(w.byId[j.clientId]), cli = cr ? Math.round(cr / 5 * 100) : 70;
  r.push(['Cliente', cr ? 'Nota ' + nf(cr) + ' como contratante' : 'Cliente novo na Freela', cli]);
  return {pct: Math.round(skill * .35 + dist * .15 + ag * .2 + bud * .15 + cli * .15), reasons: r};
}
export const why = (m: Match, fallback = 'boa combinação geral') =>
  m.reasons.filter(x => x[2] >= 90).slice(0, 3).map(x => x[1].charAt(0).toLowerCase() + x[1].slice(1)).join(', ') || fallback;

export function score(p: Person) {
  const parts: [string, number][] = [['Nota', Math.round(p.rating * 100)], ['Serviços', Math.round(Math.min(p.jobs, 250) * .8)], ['Certificados', p.certs.length * 25], ['Verificado', p.verified ? 30 : 0], ['Resposta', p.resp <= 15 ? 40 : p.resp <= 30 ? 20 : 0]];
  return {total: parts.reduce((a, x) => a + x[1], 0), parts};
}
export const rankList = (w: World, cat: CatKey | 'all') =>
  provs(w).filter(p => p.count && (cat === 'all' || p.cat === cat)).map(p => ({p, s: score(p)})).sort((a, b) => b.s.total - a.s.total);
export const position = (w: World, p: Person) => rankList(w, p.cat).findIndex(x => x.p.id === p.id) + 1;
export const earnings = (w: World, p: Person) =>
  p.base + w.orders.filter(o => o.proId === p.id && !o.seed && ['done', 'rated'].includes(o.status)).reduce((a, o) => a + (o.price || 0), 0);
export const activeOrder = (w: World) => [...w.orders].reverse().find(o => !o.seed && (o.clientId === w.meId || o.proId === w.meId));

/* ===== Rede de confiança ===== */
export const links = (w: World, id: string) => Object.values(w.net[id] || {});
export function levels(w: World, id: string, max = 3): LevelNode[][] {
  const seen: Record<string, { lvl: number; via: string[] }> = {[id]: {lvl: 0, via: []}};
  const out: LevelNode[][] = [[], [], [], []];
  let fr = [id];
  for (let l = 1; l <= max; l++) {
    const nx: string[] = [];
    fr.forEach(f => links(w, f).forEach(e => {
      const s = seen[e.id];
      if (s) { if (s.lvl === l && !s.via.includes(f)) s.via.push(f); return; }
      seen[e.id] = {lvl: l, via: [f]}; nx.push(e.id);
    }));
    nx.forEach(n => out[l].push({id: n, via: seen[n].via}));
    fr = nx;
  }
  return out;
}
export function common(w: World, a: string, b: string) {
  if (!a || !b || a === b) return [];
  const s = new Set(links(w, a).map(e => e.id));
  return links(w, b).map(e => e.id).filter(x => s.has(x) && x !== a && x !== b);
}
export const isDirect = (w: World, id: string) => links(w, w.meId).some(e => e.id === id);
export function pathTo(w: World, a: string, b: string, max = 3): string[] | null {
  const prev: Record<string, string | null> = {[a]: null};
  let fr = [a];
  for (let l = 0; l < max && fr.length; l++) {
    const nx: string[] = [];
    for (const f of fr) for (const e of links(w, f)) {
      if (e.id in prev) continue;
      prev[e.id] = f;
      if (e.id === b) { const path = [b]; let x: string | null = f; while (x) { path.unshift(x); x = prev[x]; } return path; }
      nx.push(e.id);
    }
    fr = nx;
  }
  return null;
}
export function reviewsOf(w: World, id: string) {
  return doneOrders(w).filter(o => o.proId === id || o.clientId === id).map(o => {
    const asPro = o.proId === id;
    return {o, asPro, r: asPro ? o.ratePro! : o.rateClient!, by: w.byId[asPro ? o.clientId : o.proId]};
  }).reverse();
}
export function edgeInfo(w: World, a: string, b: string) {
  const e = (w.net[a] || {})[b]; if (!e) return null;
  const s = e.svc[e.svc.length - 1];
  return {s, roles: new Set(e.svc.map(x => x.role)), n: e.svc.length};
}

/* ===== Busca de profissionais ===== */
export const SF0 = (): SearchFilters => ({text: '', cat: 'all', city: 'all', hood: 'all', km: 0, online: true, price: 0, rating: 0, avail: 'any', verified: false, certs: false, women: false, sort: 'best'});
export const PF0 = (): OppFilters => ({text: '', cat: 'mine', city: 'all', km: 0, min: 0, when: 'all', urgent: false, good: false, sort: 'match'});

export function searchPros(w: World, f: SearchFilters) {
  const ctx: MatchCtx = {cat: f.cat === 'all' ? null : f.cat, day: typeof f.avail === 'number' ? f.avail : null, urgent: f.avail === 'now'};
  // Cidade e bairro ficam de fora daqui: o texto é buscado na região toda e só depois filtrado pelo lugar,
  // assim a contagem de cada cidade na barra de região sempre bate com a lista.
  const inRegion = (p: Person) => (f.city === 'all' || (p.dist !== 0 && cityOf(p.hood) === f.city))
    && !(f.city === 'Criciúma' && f.hood !== 'all' && p.dist !== 0 && hoodOf(p.hood) !== f.hood);
  const base = provs(w).filter(p => p.id !== w.meId).filter(p => {
    if (f.cat !== 'all' && p.cat !== f.cat) return false;
    if (p.dist === 0 ? !f.online : (f.km && p.dist > f.km)) return false;
    if (f.price && p.price > f.price) return false;
    if (f.rating && (!p.count || p.rating < f.rating)) return false;
    if (f.avail === 'now' && !p.now) return false;
    if (typeof f.avail === 'number' && dayState(w, p, f.avail) !== 'free') return false;
    if (f.verified && !p.verified) return false;
    if (f.certs && !p.certs.length) return false;
    if (f.women && p.g !== 'f') return false;
    return true;
  });
  const found = textSearch(base, f.text, p => ({main: [p.name, p.role, p.skills.join(' '), CATS[p.cat].label, p.hood], extra: SYNONYMS[p.cat]}));
  const list = found.items.filter(({x: p}) => inRegion(p)).map(({x: p, score: t}) => ({p, t, m: match(w, p, ctx), s: score(p)}));
  type It = typeof list[number];
  const sorters: Record<string, (a: It, b: It) => number> = {
    best: (a, b) => (b.t - a.t) || (b.m.pct - a.m.pct) || (b.s.total - a.s.total),
    price: (a, b) => a.p.price - b.p.price,
    dist: (a, b) => (a.p.dist || 99) - (b.p.dist || 99),
    rating: (a, b) => b.p.rating - a.p.rating || b.p.count - a.p.count,
    jobs: (a, b) => b.p.jobs - a.p.jobs
  };
  list.sort(sorters[f.sort] || sorters.best);
  const active: [keyof SearchFilters, string][] = [];
  if (f.city !== 'all') active.push(['city', f.city]);
  if (f.city === 'Criciúma' && f.hood !== 'all') active.push(['hood', 'Bairro ' + f.hood]);
  if (f.km) active.push(['km', 'Até ' + f.km + ' km']);
  if (!f.online) active.push(['online', 'Sem atendimento online']);
  if (f.price) active.push(['price', 'Até ' + brl(f.price)]);
  if (f.rating) active.push(['rating', 'Nota ' + nf(f.rating) + '+']);
  if (f.avail !== 'any') active.push(['avail', f.avail === 'now' ? 'Disponível agora' : 'Livre ' + fmtDay(f.avail)]);
  if (f.verified) active.push(['verified', 'Só verificados']);
  if (f.certs) active.push(['certs', 'Com certificado']);
  if (f.women) active.push(['women', 'Profissional mulher']);
  return {list, active, ctx, approx: found.approx};
}

/* ===== Oportunidades para quem trabalha ===== */
export function oppList(w: World, p: Person, f: OppFilters) {
  const cat = f.cat === 'mine' ? p.cat : f.cat;
  const base = w.jobs.filter(j => j.status === 'open' && j.clientId !== w.meId).filter(j => {
    if (cat !== 'all' && j.cat !== cat) return false;
    const jd = jobDist(p, j);
    if (f.km && jd !== 0 && jd > f.km) return false;
    if (f.min && (!j.budget || j.budget[1] < f.min)) return false;
    if (f.when === 'today' && j.day !== TODAY) return false;
    if (f.when === 'week' && j.day > TODAY + 6) return false;
    if (f.when === 'free' && dayState(w, p, j.day) !== 'free') return false;
    if (f.urgent && !j.urgent) return false;
    if (f.good && (cRate(w.byId[j.clientId]) || 0) < 4.8) return false;
    return true;
  });
  const found = textSearch(base, f.text, j => ({main: [j.title, j.desc, w.byId[j.clientId].name, j.hood, CATS[j.cat].label], extra: SYNONYMS[j.cat]}));
  // Cidade filtrada depois do texto, como na busca de profissionais, para a barra de região bater com a lista.
  const list = found.items.filter(({x: j}) => f.city === 'all' || j.dist === 0 || cityOf(j.hood) === f.city).map(({x: j}) => ({j, m: matchJob(w, p, j)}));
  type It = typeof list[number];
  const s: Record<string, (a: It, b: It) => number> = {
    match: (a, b) => b.m.pct - a.m.pct,
    dist: (a, b) => (jobDist(p, a.j) || 99) - (jobDist(p, b.j) || 99),
    budget: (a, b) => (b.j.budget || [0, 0])[1] - (a.j.budget || [0, 0])[1],
    recent: (a, b) => a.j.ago - b.j.ago,
    day: (a, b) => a.j.day - b.j.day
  };
  return list.sort(s[f.sort] || s.match);
}
export const pfActive = (f: OppFilters) =>
  (f.city !== 'all' ? 1 : 0) + (f.text ? 1 : 0) + (f.cat !== 'mine' ? 1 : 0) + (f.km ? 1 : 0) + (f.min ? 1 : 0) + (f.when !== 'all' ? 1 : 0) + (f.urgent ? 1 : 0) + (f.good ? 1 : 0);
