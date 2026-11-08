export const IC: Record<string, string> = {
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z', tool: 'M14 6l4 4-9 9H5v-4z M12 8l4 4', spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  leaf: 'M12 21v-9M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z', layout: 'M4 4h16v16H4z M4 9h16 M9 9v11', laptop: 'M4 5h16v11H4z M2 20h20',
  cap: 'M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5', camera: 'M4 8h4l2-3h4l2 3h4v12H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-3.5-3.5', list: 'M4 3h16v18H4z M8 8h8 M8 12h8 M8 16h5',
  trophy: 'M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M7 6H4v2a3 3 0 0 0 3 3 M17 6h3v2a3 3 0 0 1-3 3', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  cal: 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4', shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z', check: 'M5 12.5l4.5 4.5L19 7', arrow: 'M7 12h10M12 7l5 5-5 5',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z', star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
  chat: 'M4 5h16v11H8l-4 4z', wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z', filter: 'M3 5h18 M6 12h12 M10 19h4', send: 'M4 12l16-8-6 16-2-7z', back: 'M15 6l-6 6 6 6', match: 'M8 12h8M13 8l4 4-4 4M11 16l-4-4 4-4', award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M9 14.5L8 22l4-2 4 2-1-7.5', briefcase: 'M3 7h18v13H3z M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', alert: 'M12 3.5 21.5 20h-19z M12 10v4.5 M12 17.3v.2', wallet: 'M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7l13-4v4 M16 14h2', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8v.2', store: 'M4 9l1.5-5h13L20 9 M4 9v11h16V9 M4 9h16 M9 20v-6h6v6', tag: 'M3 12V4h8l10 10-8 8z M7.5 8.5v.1', handshake: 'M2 11l4-4 4 2 4-2 4 2 4 4 M6 7v6l5 5 2-1 1 1 2-2 1 1 2-2-5-5 M10 9l-2 3', mail: 'M3 5h18v14H3z M3 6l9 7 9-7', users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c1-4 3.8-6 7-6s6 2 7 6 M16 3.5a4 4 0 0 1 0 7.5 M18 15c2 .7 3.3 2.7 4 6'
};

export function Icon({n, s = 20, c = 'currentColor', w = 2}: { n: string; s?: number; c?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={IC[n]} />
    </svg>
  );
}

export function Star({s = 16}: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="#E0A800" aria-hidden="true"><path d={IC.star} /></svg>;
}

/** Símbolo da marca freela: um "f" com a seta laranja, recriado da logo oficial. */
export function LogoMark({size = 36, bg = '#16305A'}: { size?: number; bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="11" fill={bg} />
      <path d="M16.8 41.4V14.9a7.6 7.6 0 0 1 7.6-7.6h8" stroke="#FFFFFF" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.8 25.2h28.4M31.6 20.2l5.6 5-5.6 5" stroke="#F28C38" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
