import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast, useStore, useToast, useWorld } from '../store';
import { Avatar } from './Avatar';
import { Icon, LogoMark } from './Icon';

type NavItem = [path: string, label: string, icon: string, short?: string];
const CLIENT_NAV: NavItem[] = [['/', 'Início', 'home'], ['/pedidos', 'Pedidos', 'list'], ['/ranking', 'Ranking', 'trophy'], ['/perfil', 'Meu perfil', 'user'], ['/parceiros', 'Parceiros', 'award']];
const PRO_NAV: NavItem[] = [['/trabalhar', 'Painel', 'briefcase'], ['/trabalhar/oportunidades', 'Oportunidades', 'search', 'Trabalhos'], ['/trabalhar/agenda', 'Agenda', 'cal'], ['/trabalhar/pedidos', 'Pedidos', 'list'], ['/ranking', 'Ranking', 'trophy'], ['/perfil', 'Meu perfil', 'user'], ['/parceiros', 'Parceiros', 'award']];
const CLIENT_ONLY = ['/', '/buscar', '/publicar'];

/** Qual item do menu fica marcado para a rota atual. */
function current(path: string, pro: boolean) {
  if (path === '/perfil' || path.startsWith('/trabalhar/perfil')) return '/perfil';
  if (path.startsWith('/perfil/')) return pro ? '/trabalhar' : '/';
  if (path.startsWith('/pedidos/') || path.includes('/orcamento')) return pro ? '/trabalhar/pedidos' : '/pedidos';
  if (path.startsWith('/publicar') || path === '/buscar') return '/';
  if (path.startsWith('/trabalhar/oportunidades')) return '/trabalhar/oportunidades';
  return path;
}

export default function Layout() {
  const {pathname} = useLocation(), nav = useNavigate();
  const mode = useStore(s => s.mode), setMode = useStore(s => s.setMode), reset = useStore(s => s.reset);
  const w = useWorld(), msg = useToast(s => s.text);

  useEffect(() => {
    if (pathname.startsWith('/trabalhar')) setMode('pro');
    else if (CLIENT_ONLY.includes(pathname) || pathname === '/pedidos') setMode('client');
  }, [pathname, setMode]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const pro = mode === 'pro', items = pro ? PRO_NAV : CLIENT_NAV, cur = current(pathname, pro);
  const switchMode = (m: 'client' | 'pro') => { setMode(m); nav(m === 'client' ? '/' : '/trabalhar'); };

  return (
    <div className="app">
      <header className={'hdr' + (pro ? ' pro' : '')}>
        <div className="hin">
          <button className="logo" onClick={() => nav(pro ? '/trabalhar' : '/')} aria-label="freela, Criciúma e região, início">
            <LogoMark />
            <span className="logo-txt"><b>freela</b><small>Criciúma e região</small></span>
          </button>
          <div className="mode" role="group" aria-label="Áreas da mesma conta">
            <button aria-pressed={!pro} onClick={() => switchMode('client')}>Contratar</button>
            <button aria-pressed={pro} onClick={() => switchMode('pro')}>Trabalhar</button>
          </div>
          <nav className="topnav" aria-label="Menu">
            {items.map(n => <button key={n[0]} aria-current={cur === n[0]} onClick={() => nav(n[0])}>{n[1]}</button>)}
          </nav>
          <button className="me-btn" onClick={() => nav('/perfil')} aria-label="Meu perfil"><Avatar u={w.me} size={34} /></button>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <p className="foot">
        Freela · Criciúma e região (AMREC) · pessoas, avaliações e valores fictícios · hoje é sábado, 7 de novembro.{' '}
        <button className="reset-lnk" onClick={() => { if (confirm('Restaurar todos os dados de exemplo? Pedidos e alterações feitas serão perdidos.')) { reset(); toast('Dados de exemplo restaurados.'); nav('/'); } }}>Restaurar dados de exemplo</button>
      </p>
      <nav className="botnav" aria-label="Menu">
        {items.filter(n => n[0] !== '/trabalhar/pedidos').map(n => (
          <button key={n[0]} aria-current={cur === n[0]} onClick={() => nav(n[0])}><Icon n={n[2]} s={22} />{n[3] || n[1]}</button>
        ))}
      </nav>
      <div role="status" aria-live="polite">{msg && <div className="toast">{msg}</div>}</div>
    </div>
  );
}
