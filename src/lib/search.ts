/* Busca tolerante: ignora acentos, maiúsculas e plural, entende sinônimos de cada profissão
   e aceita pequenos erros de digitação (ex.: "eletrecista", "faxinera", "domestica"). */
import type { CatKey } from './types';
import { norm } from './format';

/** Palavras que as pessoas usam para procurar cada tipo de serviço. */
export const SYNONYMS: Record<CatKey, string[]> = {
  ele: ['eletricista', 'eletrica', 'eletrico', 'luz', 'energia', 'tomada', 'chuveiro', 'disjuntor', 'fiacao', 'lampada', 'iluminacao', 'curto', 'quadro'],
  mon: ['montador', 'montagem', 'moveis', 'movel', 'marceneiro', 'marcenaria', 'armario', 'guarda-roupa', 'cama', 'estante', 'painel', 'cozinha'],
  lim: ['diarista', 'domestica', 'empregada', 'faxineira', 'faxina', 'limpeza', 'limpar', 'faxinar', 'passadeira', 'passar', 'roupa', 'arrumadeira', 'organizacao', 'pos-obra'],
  jar: ['jardineiro', 'jardinagem', 'jardim', 'grama', 'gramado', 'poda', 'podar', 'paisagista', 'paisagismo', 'roçada', 'quintal', 'arvore'],
  web: ['site', 'sites', 'programador', 'desenvolvedor', 'web', 'designer', 'design', 'logo', 'logotipo', 'marca', 'loja', 'virtual', 'redes', 'sociais', 'arte'],
  tec: ['informatica', 'tecnico', 'computador', 'pc', 'notebook', 'formatar', 'formatacao', 'wifi', 'wi-fi', 'internet', 'rede', 'impressora', 'backup', 'celular'],
  aul: ['professor', 'professora', 'aula', 'aulas', 'reforco', 'escolar', 'ingles', 'matematica', 'curso', 'tutor', 'explicadora'],
  eve: ['fotografo', 'fotografa', 'foto', 'fotos', 'fotografia', 'evento', 'festa', 'aniversario', 'casamento', 'ensaio', 'filmagem'],
  ger: ['pedreiro', 'pintor', 'pintora', 'pintura', 'encanador', 'encanamento', 'vazamento', 'desentupir', 'faz-tudo', 'marido', 'aluguel', 'reparo', 'conserto', 'reforma', 'carreto', 'mudanca', 'frete', 'textura', 'piso', 'torneira']
};

const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'pra', 'e', 'em', 'um', 'uma', 'o', 'a', 'os', 'as', 'com', 'no', 'na', 'nos', 'nas', 'que', 'meu', 'minha',
  'preciso', 'quero', 'procuro', 'busco', 'alguem', 'servico', 'servicos', 'profissional', 'profissionais', 'bom', 'boa']);

/** Reduz a palavra a uma forma comum: sem acento, sem plural e sem a vogal final (pintor/pintora/pintores). */
const stem = (w: string) => {
  let s = w.replace(/(oes|aes)$/, 'ao').replace(/(es|s)$/, w.length > 4 ? '' : '$1');
  if (s.length > 4) s = s.replace(/[aoe]$/, '');
  return s;
};
const words = (text: string) => norm(text).split(/[^a-z0-9]+/).filter(Boolean);
export const tokens = (text: string) => words(text).filter(t => !STOP.has(t)).map(stem);

/** Distância de edição (Levenshtein) com saída antecipada quando passa do limite. */
function lev(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Quão bem um termo digitado combina com uma palavra do perfil (0 = não combina). */
function termScore(t: string, w: string) {
  if (t === w) return 3;
  if (t.length >= 3 && w.startsWith(t)) return 2.5;
  if (t.length >= 5 && w.includes(t)) return 2;
  const max = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
  if (!max || t[0] !== w[0]) return 0; // erro de digitação raramente está na primeira letra (evita "vazamento" ~ "casamento")
  if (lev(t, w, max) <= max) return 1.5;
  if (t.length >= 5 && w.length > t.length && lev(t, w.slice(0, t.length), 1) <= 1) return 1; // começo da palavra com erro
  return 0;
}

/** Monta o índice de palavras de um item (perfil ou pedido). */
export const index = (fields: string[]) => [...new Set(fields.flatMap(words).map(stem))];

/** Pontua um item para os termos buscados. `all`: todos os termos precisam combinar. */
export function scoreItem(terms: string[], idx: string[], all: boolean) {
  let total = 0, hits = 0;
  for (const t of terms) {
    let best = 0;
    for (const w of idx) { const s = termScore(t, w); if (s > best) best = s; if (best === 3) break; }
    if (best) { hits++; total += best; } else if (all) return 0;
  }
  return hits ? total + hits : 0;
}

/**
 * Filtra itens pela busca, em camadas:
 * 1. todos os termos nos campos principais (nome, profissão, habilidades...);
 * 2. se nada combinar, também nos sinônimos da categoria (ex.: "doméstica" acha a diarista);
 * 3. se ainda nada combinar, qualquer termo, e o resultado é marcado como aproximado.
 */
export function textSearch<T>(items: T[], text: string, fields: (x: T) => { main: string[]; extra: string[] }) {
  const terms = tokens(text);
  if (!terms.length) return {items: items.map(x => ({x, score: 0})), approx: false};
  const main = items.map(x => index(fields(x).main));
  const full = items.map((x, i) => [...new Set([...main[i], ...index(fields(x).extra)])]);
  const run = (idx: string[][], all: boolean) => items.map((x, i) => ({x, score: scoreItem(terms, idx[i], all)})).filter(r => r.score > 0);
  const primary = run(main, true);
  if (primary.length) return {items: primary, approx: false};
  const synonyms = run(full, true);
  if (synonyms.length) return {items: synonyms, approx: false};
  const loose = run(full, false);
  return {items: loose, approx: loose.length > 0};
}
