import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scale, User, Plus, Home, Grid3X3, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { Language } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const languages: { code: Language; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { compareList } = useCompare();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/catalog', label: t.nav.catalog, icon: Grid3X3 },
    { to: '/upload', label: t.nav.upload, icon: Plus },
    { to: '/dashboard', label: t.nav.dashboard, icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">YN</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
              Yeni Nəfəs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={cn(
                    'gap-2',
                    isActive(link.to) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Login Button */}
            <Link to="/auth" className="hidden md:block">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                {t.nav.login}
              </Button>
            </Link>

            {/* Compare Button */}
            <Link to="/compare">
              <Button variant="ghost" size="icon" className="relative">
                <Scale className="w-5 h-5" />
                {compareList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive(link.to) && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Button>
                </Link>
              ))}

              {/* Mobile Login Button */}
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 mt-2"
                >
                  <LogIn className="w-5 h-5" />
                  {t.nav.login}
                </Button>
              </Link>
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 pt-4 border-t border-border mt-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                      language === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
