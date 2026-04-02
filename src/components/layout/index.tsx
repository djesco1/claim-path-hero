import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, PlusCircle, User, Tag, Menu, X, LogOut, BarChart3, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials, getInitialsColor } from '@/lib/utils';
import LegalAssistant from '@/components/assistant/LegalAssistant';

const publicLinks = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#tipos', label: 'Tipos de reclamación' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
];

const privateLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/claims/new', label: 'Nueva Reclamación', icon: PlusCircle },
  { href: '/analytics', label: 'Estadísticas', icon: BarChart3 },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/pricing', label: 'Precios', icon: Tag },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-foreground">ClaimPath</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild><Link to="/login">Iniciar sesión</Link></Button>
          <Button asChild><Link to="/register">Empezar gratis</Link></Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          {publicLinks.map(l => (
            <a key={l.href} href={l.href} className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" asChild className="flex-1"><Link to="/login">Iniciar sesión</Link></Button>
            <Button asChild className="flex-1"><Link to="/register">Empezar gratis</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size={collapsed ? 'icon' : 'sm'}
      className={cn("text-muted-foreground", !collapsed && "w-full justify-start gap-3")}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!collapsed && (isDark ? 'Modo claro' : 'Modo oscuro')}
    </Button>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className={cn(
      "hidden lg:flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-200",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-2 p-4 border-b">
        <Shield className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && <span className="font-bold text-foreground">ClaimPath</span>}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {privateLinks.map(l => {
          const active = location.pathname === l.href;
          return (
            <Link
              key={l.href}
              to={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <l.icon className="h-5 w-5 shrink-0" />
              {!collapsed && l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        {profile && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground shrink-0", getInitialsColor(profile.full_name))}>
              {getInitials(profile.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{profile.full_name}</p>
              <span className="text-xs text-muted-foreground capitalize">{profile.plan}</span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Cerrar sesión'}
        </Button>
        <Button variant="ghost" size="icon" className="w-full mt-1" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const location = useLocation();
  const items = [
    { href: '/dashboard', icon: Home, label: 'Inicio' },
    { href: '/claims/new', icon: PlusCircle, label: 'Nueva' },
    { href: '/analytics', icon: BarChart3, label: 'Stats' },
    { href: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-2">
        {items.map(item => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 min-w-[44px] min-h-[44px] justify-center",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("flex-1 min-h-screen pb-20 lg:pb-0", className)}>
      {children}
    </main>
  );
}

export function AppLayout({ children, claimId, claimTitle }: { children: React.ReactNode; claimId?: string; claimTitle?: string }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <PageWrapper>{children}</PageWrapper>
      <BottomNav />
      <LegalAssistant claimId={claimId} claimTitle={claimTitle} />
    </div>
  );
}
