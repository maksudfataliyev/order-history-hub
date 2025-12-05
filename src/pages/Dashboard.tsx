import { useState } from 'react';
import { Package, MessageSquare, RefreshCw, Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockProducts } from '@/data/products';
import { cn } from '@/lib/utils';

const myListings = mockProducts.slice(0, 3).map((p, i) => ({
  ...p,
  status: i === 0 ? 'active' : i === 1 ? 'pending' : 'sold',
}));

const mockMessages = [
  { id: '1', from: 'Anar M.', message: 'Is the sofa still available?', time: '2h ago', unread: true },
  { id: '2', from: 'Leyla H.', message: 'Would you accept a trade for...', time: '1d ago', unread: false },
  { id: '3', from: 'Rashad K.', message: 'Thank you for the quick delivery!', time: '3d ago', unread: false },
];

const mockOffers = [
  { id: '1', from: 'Nigar A.', type: 'barter', item: 'Oak Dining Table', forItem: 'Mid-Century Sofa', status: 'pending' },
  { id: '2', from: 'Elvin G.', type: 'price', amount: 750, forItem: 'Mid-Century Sofa', status: 'pending' },
  { id: '3', from: 'Kamran S.', type: 'barter', item: 'Office Desk', forItem: 'Vintage Chair', status: 'accepted' },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('listings');

  const stats = [
    { label: t.dashboard.active, value: 2, color: 'bg-sage' },
    { label: t.dashboard.pending, value: 1, color: 'bg-primary' },
    { label: t.dashboard.sold, value: 5, color: 'bg-muted' },
  ];

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.dashboard.title}
            </h1>
            <p className="text-muted-foreground">Welcome back, User!</p>
          </div>
          <Link to="/upload">
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              {t.nav.upload}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.myListings}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.messages}</span>
              <Badge className="ml-1 bg-primary text-primary-foreground">1</Badge>
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.offers}</span>
              <Badge className="ml-1 bg-sage text-sage-dark">2</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            <div className="space-y-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  <img
                    src={listing.image}
                    alt={listing.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{listing.name}</h3>
                    <p className="text-sm text-muted-foreground">₼{listing.price}</p>
                  </div>
                  <Badge
                    className={cn(
                      listing.status === 'active' && 'bg-sage text-sage-dark',
                      listing.status === 'pending' && 'bg-primary/20 text-primary',
                      listing.status === 'sold' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {t.dashboard[listing.status as keyof typeof t.dashboard]}
                  </Badge>
                  <Link to={`/product/${listing.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <div className="space-y-3">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer',
                    msg.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold text-muted-foreground">
                      {msg.from.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{msg.from}</span>
                      {msg.unread && <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="mt-6">
            <div className="space-y-4">
              {mockOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 bg-card border border-border rounded-xl"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{offer.from}</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.type === 'barter' 
                          ? `Wants to trade "${offer.item}" for your "${offer.forItem}"`
                          : `Offered ₼${offer.amount} for "${offer.forItem}"`
                        }
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        offer.status === 'pending' && 'bg-primary/20 text-primary',
                        offer.status === 'accepted' && 'bg-sage text-sage-dark'
                      )}
                    >
                      {offer.status}
                    </Badge>
                  </div>
                  {offer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="hero" size="sm">Accept</Button>
                      <Button variant="outline" size="sm">Decline</Button>
                      <Button variant="ghost" size="sm">Counter</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
