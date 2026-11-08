export type CatKey = 'ele' | 'mon' | 'lim' | 'jar' | 'web' | 'tec' | 'aul' | 'eve' | 'ger';

export interface Category {
  label: string;
  icon: string;
  remote: boolean;
  ref: [number, number];
  time: string;
  tip: string;
}

/** Conta única: a mesma pessoa contrata e (opcionalmente) presta serviços. */
export interface User {
  id: string;
  name: string;
  g?: 'm' | 'f';
  provider: boolean;
  verified: boolean;
  since: string;
  hood: string;
  dist: number;
  bio: string;
  cat: CatKey;
  role: string;
  years: number;
  price: number;
  resp: number;
  now: boolean;
  base: number;
  busy: number[];
  agenda: Record<number, 'free' | 'off'>;
  certs: string[];
  skills: string[];
  port: string[];
}

/** Notas calculadas a partir do histórico de avaliações. */
export interface Person extends User {
  rating: number;
  count: number;
  jobs: number;
  crating: number;
  ccount: number;
}

export interface Rating { stars: number; text: string }
export interface Msg { from: 'client' | 'pro' | 'sys'; text: string }
export type Reason = [string, string, number];
export interface Match { pct: number; reasons: Reason[] }

export type OrderStatus = 'sent' | 'accepted' | 'paid' | 'done' | 'rated';

export interface Order {
  id: string;
  clientId: string;
  proId: string;
  cat: CatKey;
  title: string;
  desc: string;
  date: string | null;
  day: number | null;
  time: string;
  urgent?: boolean;
  /** Compra segurada: cobre roubo ou furto durante o serviço, com taxa extra para quem contrata. */
  insured?: boolean;
  price: number | null;
  status: OrderStatus;
  seed?: boolean;
  ratePro: Rating | null;
  rateClient: Rating | null;
  msgs: Msg[];
  match: Match | null;
}

export interface Proposal { proId: string; price: number; msg: string }

export interface Job {
  id: string;
  clientId: string;
  hood: string;
  dist: number | null;
  cat: CatKey;
  title: string;
  desc: string;
  budget: [number, number] | null;
  day: number;
  time: string;
  urgent: boolean;
  ago: number;
  others: number;
  proposals: Proposal[];
  status: 'open' | 'hired';
  pub: boolean;
}

export interface SearchFilters {
  text: string;
  cat: CatKey | 'all';
  city: string;
  km: number;
  online: boolean;
  price: number;
  rating: number;
  avail: 'any' | 'now' | number;
  verified: boolean;
  certs: boolean;
  women: boolean;
  sort: 'best' | 'rating' | 'price' | 'dist' | 'jobs';
}

export interface OppFilters {
  text: string;
  cat: CatKey | 'all' | 'mine';
  city: string;
  km: number;
  min: number;
  when: 'all' | 'today' | 'week' | 'free';
  urgent: boolean;
  good: boolean;
  sort: 'match' | 'dist' | 'budget' | 'recent' | 'day';
}
