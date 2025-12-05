import { Upload, Search, RefreshCw, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  { key: 'upload', icon: Upload },
  { key: 'browse', icon: Search },
  { key: 'trade', icon: RefreshCw },
  { key: 'enjoy', icon: Truck },
] as const;

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/50">
      <div className="container-custom">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-foreground mb-16">
          {t.features.title}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const featureData = t.features[feature.key];
            
            return (
              <div
                key={feature.key}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-medium">
                    <Icon className="w-9 h-9 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-sage text-sage-dark rounded-full flex items-center justify-center font-display font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {featureData.title}
                </h3>
                <p className="text-muted-foreground">
                  {featureData.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
