import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CATS, ME, SEED_INCOMING, SEED_JOBS, SEED_ORDERS, SEED_PROS, SEED_USERS, TODAY } from './data/seed';
import { brlc, clientTotal, first, fmtDay, priceMsg } from './lib/format';
import type { CatKey, Job, OppFilters, Order, Rating, SearchFilters, User } from './lib/types';
import { buildWorld, match, matchJob, PF0, POS, provs, SF0 } from './lib/world';

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

interface Data {
  meId: string;
  mode: 'client' | 'pro';
  users: User[];
  orders: Order[];
  jobs: Job[];
  n: number;
  sf: SearchFilters;
  pf: OppFilters;
  rank: CatKey | 'all';
  leads: { name: string; contact: string }[];
}

function fresh(): Data {
  const d: Data = {
    meId: ME, mode: 'client', users: clone(SEED_PROS.concat(SEED_USERS)), orders: clone(SEED_ORDERS), jobs: clone(SEED_JOBS),
    n: 1, sf: SF0(), pf: PF0(), rank: 'all', leads: []
  };
  const w = buildWorld(d);
  SEED_INCOMING.forEach(o => {
    const c = clone(o);
    c.match = match(w, w.byId[c.proId], {cat: c.cat, day: c.day});
    d.orders.push(c);
  });
  return d;
}

export interface PublishInput { cat: CatKey; title: string; desc: string; budget: number; day: number; time: string }
export interface ProfileInput { role: string; bio: string; years: number; price: number; skills: string[]; certs: string[] }

interface Actions {
  setMode: (m: Data['mode']) => void;
  setSf: (p: Partial<SearchFilters>) => void;
  resetSf: (p?: Partial<SearchFilters>) => void;
  setPf: (p: Partial<OppFilters>) => void;
  resetPf: () => void;
  setRank: (c: CatKey | 'all') => void;
  /** Contratar direto pelo perfil. Retorna o id do pedido. */
  sendOrder: (proId: string, day: number, time: string) => string;
  simAccept: (id: string) => void;
  acceptQuote: (id: string, price: number, text: string) => void;
  pay: (id: string) => void;
  finish: (id: string) => void;
  rate: (id: string, r: Rating) => 'pending' | 'connected' | 'noconn' | 'invalid';
  simRate: (id: string) => 'connected' | 'noconn' | 'invalid';
  sendMsg: (id: string, text: string) => void;
  publishJob: (p: PublishInput) => number;
  acceptProposal: (jobId: string, idx: number) => string;
  sendProposal: (jobId: string, price: number, msg: string) => void;
  simClientAccept: (jobId: string) => string;
  toggleNow: () => void;
  toggleDay: (d: number) => void;
  updateProfile: (p: ProfileInput) => void;
  addLead: (l: Data['leads'][number]) => void;
  reset: () => void;
}

export type Store = Data & Actions;

export const useStore = create<Store>()(persist(immer((set, get) => {
  const w = () => buildWorld(get());
  const nextId = (prefix: string) => { const id = prefix + get().n; set(s => { s.n++; }); return id; };
  const finalize = (o: Order) => { o.status = 'rated'; o.date = 'nov/2026'; return o.ratePro!.stars >= POS && o.rateClient!.stars >= POS ? 'connected' as const : 'noconn' as const; };
  return {
    ...fresh(),
    setMode: (m) => set(s => { s.mode = m; }),
    setSf: (p) => set(s => { Object.assign(s.sf, p); }),
    resetSf: (p) => set(s => { s.sf = {...SF0(), ...p}; }),
    setPf: (p) => set(s => { Object.assign(s.pf, p); }),
    resetPf: () => set(s => { s.pf = PF0(); }),
    setRank: (c) => set(s => { s.rank = c; }),
    sendOrder: (proId, day, time) => {
      const wd = w(), p = wd.byId[proId], id = nextId('o');
      const o: Order = {id, proId, clientId: wd.meId, cat: p.cat, title: p.cat === 'ger' ? p.role : 'Serviço de ' + CATS[p.cat].label.toLowerCase(), desc: '', date: null,
        day, time, price: null, status: 'sent', msgs: [{from: 'client', text: 'Olá! Gostaria de um orçamento.'}], ratePro: null, rateClient: null,
        match: match(wd, p, {cat: p.cat, day})};
      set(s => { s.orders.push(o); });
      return id;
    },
    simAccept: (id) => {
      const wd = w(), o0 = wd.orders.find(x => x.id === id)!, p = wd.byId[o0.proId];
      set(s => {
        const o = s.orders.find(x => x.id === id)!;
        o.price = p.price; o.status = 'accepted';
        o.msgs.push({from: 'pro', text: `Oi, ${first(wd.byId[o.clientId].name)}! Posso atender ${fmtDay(o.day!)} às ${o.time}. ${priceMsg(p.price)}`});
      });
    },
    acceptQuote: (id, price, text) => set(s => {
      const o = s.orders.find(x => x.id === id)!;
      o.price = price; o.status = 'accepted'; o.msgs.push({from: 'pro', text});
    }),
    pay: (id) => set(s => {
      const o = s.orders.find(x => x.id === id)!;
      o.status = 'paid'; o.msgs.push({from: 'sys', text: `Pagamento de ${brlc(clientTotal(o.price || 0))} guardado com proteção.`});
    }),
    finish: (id) => set(s => {
      const o = s.orders.find(x => x.id === id)!, p = s.users.find(u => u.id === o.proId)!;
      o.status = 'done'; o.msgs.push({from: 'sys', text: `Serviço concluído. Pagamento liberado para ${first(p.name)}.`});
    }),
    rate: (id, r) => {
      let res: ReturnType<Actions['rate']> = 'invalid';
      set(s => {
        const o = s.orders.find(x => x.id === id)!, c = o.clientId === s.meId;
        if (!c && o.proId !== s.meId) return;
        if (o.status !== 'done' || (c ? o.ratePro : o.rateClient)) return;
        if (c) o.ratePro = r; else o.rateClient = r;
        res = o.ratePro && o.rateClient ? finalize(o) : 'pending';
      });
      return res;
    },
    simRate: (id) => {
      let res: ReturnType<Actions['simRate']> = 'invalid';
      set(s => {
        const o = s.orders.find(x => x.id === id)!;
        if (o.status !== 'done') return;
        if (!o.ratePro) o.ratePro = {stars: 5, text: 'Pontual, cuidadoso e deixou tudo limpo.'};
        if (!o.rateClient) o.rateClient = {stars: 5, text: 'Cliente atencioso, explicou tudo e pagou pelo app.'};
        res = finalize(o);
      });
      return res;
    },
    sendMsg: (id, text) => set(s => {
      const o = s.orders.find(x => x.id === id)!;
      o.msgs.push({from: o.clientId === s.meId ? 'client' : 'pro', text});
    }),
    publishJob: (inp) => {
      const wd = w(), me = wd.me, id = nextId('j');
      const j: Job = {id, pub: true, clientId: wd.meId, hood: me.hood, dist: null, cat: inp.cat, title: inp.title, desc: inp.desc,
        budget: inp.budget ? [Math.round(inp.budget * .5), inp.budget] : null, day: inp.day, time: inp.time, urgent: false, ago: 0, others: 0, proposals: [], status: 'open'};
      // Simulação: os profissionais mais compatíveis da área respondem na hora
      provs(wd).filter(p => p.cat === inp.cat && p.id !== wd.meId).map(p => ({p, m: matchJob(wd, p, j)})).sort((a, b) => b.m.pct - a.m.pct).slice(0, 3).forEach(({p}) => {
        const price = j.budget ? Math.min(Math.max(p.price, j.budget[0]), j.budget[1]) : p.price;
        j.proposals.push({proId: p.id, price, msg: `Oi, ${first(me.name)}! Posso atender ${fmtDay(j.day)} às ${j.time}. ${priceMsg(price)}`});
      });
      set(s => { s.jobs.unshift(j); });
      return j.proposals.length;
    },
    acceptProposal: (jobId, idx) => {
      const wd = w(), j = wd.jobs.find(x => x.id === jobId)!, pp = j.proposals[idx], p = wd.byId[pp.proId], id = nextId('o');
      const o: Order = {id, proId: p.id, clientId: wd.meId, cat: j.cat, title: j.title, desc: j.desc, date: null, day: j.day, time: j.time, urgent: j.urgent, price: pp.price,
        status: 'accepted', msgs: [{from: 'client', text: j.desc || 'Pedido publicado.'}, {from: 'pro', text: pp.msg}], ratePro: null, rateClient: null, match: matchJob(wd, p, j)};
      set(s => { s.jobs.find(x => x.id === jobId)!.status = 'hired'; s.orders.push(o); });
      return id;
    },
    sendProposal: (jobId, price, msg) => set(s => {
      const j = s.jobs.find(x => x.id === jobId)!;
      j.proposals = j.proposals.filter(x => x.proId !== s.meId);
      j.proposals.push({proId: s.meId, price, msg});
    }),
    simClientAccept: (jobId) => {
      const wd = w(), j = wd.jobs.find(x => x.id === jobId)!, p = wd.me, pp = j.proposals.find(x => x.proId === p.id)!, id = nextId('o');
      const o: Order = {id, proId: p.id, clientId: j.clientId, cat: j.cat, title: j.title, desc: j.desc, date: null, day: j.urgent ? TODAY : j.day, time: j.time === 'agora' ? '9h' : j.time,
        price: pp.price, status: 'paid', msgs: [{from: 'pro', text: pp.msg}, {from: 'sys', text: first(wd.byId[j.clientId].name) + ' aceitou sua proposta e pagou ' + brlc(clientTotal(pp.price)) + ' com proteção.'}],
        ratePro: null, rateClient: null, match: matchJob(wd, p, j)};
      set(s => { s.jobs.find(x => x.id === jobId)!.status = 'hired'; s.orders.push(o); });
      return id;
    },
    toggleNow: () => set(s => { const me = s.users.find(u => u.id === s.meId)!; me.now = !me.now; }),
    toggleDay: (d) => {
      const wd = w(), st = (() => { const p = wd.me; if (p.busy.includes(d)) return 'busy'; if (p.agenda[d]) return p.agenda[d]; return (d - 1) % 7 === 0 ? 'off' : 'free'; })();
      if (d < TODAY || st === 'busy' || wd.orders.some(o => o.proId === wd.meId && o.day === d && ['accepted', 'paid'].includes(o.status))) return;
      set(s => { const me = s.users.find(u => u.id === s.meId)!; me.agenda[d] = st === 'free' ? 'off' : 'free'; });
    },
    updateProfile: (p) => set(s => { Object.assign(s.users.find(u => u.id === s.meId)!, p); }),
    addLead: (l) => set(s => { s.leads.push(l); }),
    reset: () => set(() => ({...fresh(), mode: get().mode}))
  };
}), {
  name: 'freela-react-v1',
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({meId: s.meId, mode: s.mode, users: s.users, orders: s.orders, jobs: s.jobs, n: s.n, sf: s.sf, pf: s.pf, rank: s.rank, leads: s.leads})
}));

/** Visão calculada do estado: notas, rede de confiança, etc. */
export function useWorld() {
  const users = useStore(s => s.users), orders = useStore(s => s.orders), jobs = useStore(s => s.jobs), meId = useStore(s => s.meId);
  return useMemo(() => buildWorld({users, orders, jobs, meId}), [users, orders, jobs, meId]);
}

/* Avisos rápidos (toast) */
interface ToastStore { text: string | null; show: (t: string) => void }
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export const useToast = create<ToastStore>((set) => ({
  text: null,
  show: (t) => { set({text: t}); clearTimeout(toastTimer); toastTimer = setTimeout(() => set({text: null}), 2800); }
}));
export const toast = (t: string) => useToast.getState().show(t);
