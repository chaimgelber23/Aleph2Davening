'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.FC<{ active: boolean }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: '/', label: 'Home', icon: HomeNavIcon },
  { href: '/hebrew', label: 'Hebrew', icon: HebrewIcon },
  { href: '/daven', label: 'Daven', icon: DavenIcon },
  { href: '/yahrzeit', label: 'Yahrzeit', icon: YahrzeitIcon },
  { href: '/living', label: 'Living', icon: LivingIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-20" />
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Frosted glass background */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                />
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.FC<{ active: boolean }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px]
        transition-colors duration-200
        ${active ? 'text-primary' : 'text-gray-400 active:text-gray-500'}
      `}
    >
      <div className="relative">
        <Icon active={active} />
        {active && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
        )}
      </div>
      <span
        className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}
      >
        {label}
      </span>
    </Link>
  );
}

// Home — dashboard grid
function HomeNavIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

// Hebrew — aleph character in a circle
function HebrewIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6s3-3 10-3 10 3 10 3v12s-3 3-10 3S2 18 2 18V6Z" />
      <path d="M2 6s3 3 10 3 10-3 10-3" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M12 9v13" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6s3-3 10-3 10 3 10 3v12s-3 3-10 3S2 18 2 18V6Z" />
      <path d="M2 6s3 3 10 3 10-3 10-3" />
      <path d="M12 9v13" />
    </svg>
  );
}

// Daven — siddur book
function DavenIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
      <path d="M8 6h8M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
      <path d="M8 6h8M8 10h8M8 14h5" />
    </svg>
  );
}

// Yahrzeit — candle
function YahrzeitIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="10" width="6" height="12" rx="1" />
      <path d="M12 2c-1.5 2-3 3.5-3 5.5a3 3 0 0 0 6 0C15 5.5 13.5 4 12 2Z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="10" width="6" height="12" rx="1" />
      <path d="M12 2c-1.5 2-3 3.5-3 5.5a3 3 0 0 0 6 0C15 5.5 13.5 4 12 2Z" />
    </svg>
  );
}

// Living — house/home
function LivingIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.707 2.293a1 1 0 0 0-1.414 0l-9 9a1 1 0 0 0 .707 1.707H4v7a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a2 2 0 0 1 4 0v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9Z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a2 2 0 01-2-2v-3a2 2 0 014 0v3a2 2 0 01-2 2z" />
    </svg>
  );
}
