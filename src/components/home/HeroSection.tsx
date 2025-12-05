import { Link } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-sage/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float animation-delay-200" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              {t.hero.title}{' '}
              <span className="text-primary">{t.hero.titleHighlight}</span>
              {t.hero.titleEnd && ` ${t.hero.titleEnd}`}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up animation-delay-200">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up animation-delay-400">
              <Link to="/catalog">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Upload className="w-5 h-5 mr-2" />
                  {t.hero.uploadCta}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border animate-fade-in animation-delay-600">
              <div>
                <p className="font-display text-3xl font-bold text-primary">2.5K+</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">1.2K+</p>
                <p className="text-sm text-muted-foreground">Successful Trades</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">850+</p>
                <p className="text-sm text-muted-foreground">Happy Users</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-scale-in">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
                alt="Modern sofa"
                className="rounded-2xl shadow-strong"
              />
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-medium border border-border animate-float">
                <p className="text-sm text-muted-foreground mb-1">Latest Trade</p>
                <p className="font-display font-semibold">Sofa ↔ Dining Set</p>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-sage text-sage-dark px-4 py-2 rounded-full shadow-medium animate-float animation-delay-400">
                <span className="font-semibold">Barter Available</span>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-sage/20 rounded-3xl -z-10 blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};
