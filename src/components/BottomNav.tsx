'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PRIMARY = '#2A4491'

const navItems = [
  {
    href: '/',
    label: 'Plantões',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? PRIMARY : '#9ca3af'} strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/criar',
    label: 'Criar',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? PRIMARY : '#9ca3af'} strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? PRIMARY : '#9ca3af'} strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? PRIMARY : '#9ca3af'} strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium" style={{ color: active ? PRIMARY : '#9ca3af' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
