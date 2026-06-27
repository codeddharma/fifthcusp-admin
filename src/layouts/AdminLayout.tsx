import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  PackageSearch,
  Newspaper,
  HelpCircle,
  MessageSquareQuote,
  Briefcase,
  Contact,
  LogOut,
  Sparkles,
  UserCog,
  Menu,
  X,
  Search,
  Tag,
  Link2,
  Repeat,
  CalendarDays,
  Bell,
  Moon,
  AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth/useAuth'
import { Resource, can } from '@/lib/auth/permissions'

interface NavItem {
  to: string
  label: string
  icon: typeof Users
  resource?: Resource
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, resource: 'orders' },
  { to: '/services', label: 'Services', icon: PackageSearch, resource: 'services' },
  { to: '/customers', label: 'Customers', icon: Contact, resource: 'customers' },
  { to: '/users', label: 'Users', icon: Users, resource: 'users' },
  { to: '/blogs', label: 'Blogs', icon: Newspaper, resource: 'blogs' },
  { to: '/faqs', label: 'FAQs', icon: HelpCircle, resource: 'faqs' },
  { to: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote, resource: 'testimonials' },
  { to: '/careers', label: 'Careers', icon: Briefcase, resource: 'careers' },
  { to: '/page-meta', label: 'SEO Meta', icon: Search, resource: 'pageMeta' },
  { to: '/coupons', label: 'Coupons', icon: Tag, resource: 'coupons' },
  { to: '/payment-links', label: 'Payment Links', icon: Link2, resource: 'paymentLinks' },
  { to: '/recurring-orders', label: 'Recurring Orders', icon: Repeat, resource: 'paymentLinks' },
  { to: '/consultation-events', label: 'Consultations', icon: CalendarDays, resource: 'consultationEvents' },
  { to: '/remedy-events', label: 'Remedy Events', icon: Bell, resource: 'remedyEvents' },
  { to: '/calendar-events', label: 'Calendar Events', icon: Moon, resource: 'calendarEvents' },
  { to: '/disclaimer-banner', label: 'Disclaimer Banner', icon: AlertTriangle, resource: 'disclaimerBanner' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const visible = NAV.filter((n) => !n.resource || can(user?.role, n.resource, 'read'))
  const currentLabel = visible.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-shell-bg">
      {/* Sidebar (drawer on mobile, fixed column on desktop) */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-shell-sidebar text-white transition-transform duration-200 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-modal' : '-translate-x-full',
        )}
        aria-hidden={!mobileOpen ? undefined : false}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-lavender" />
            <span className="text-sm font-semibold">FifthCusp Admin</span>
          </div>
          <button
            type="button"
            className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 scroll-thin">
          {visible.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-shell-sidebar-active text-white'
                      : 'text-white/70 hover:bg-shell-sidebar-hover hover:text-white',
                  )
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-shell-sidebar-hover hover:text-white"
          >
            <UserCog size={16} />
            <span className="min-w-0 flex-1 truncate">{user?.name ?? '—'}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
              {user?.role}
            </span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-shell-sidebar-hover hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Drawer backdrop (mobile only) */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-shell-heading/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-shell-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded p-1 text-shell-text hover:bg-shell-bg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="truncate text-sm font-semibold text-shell-heading">{currentLabel}</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
