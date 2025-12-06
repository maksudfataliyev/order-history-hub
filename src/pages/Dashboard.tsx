import { useState, useEffect } from 'react';
import { Package, MessageSquare, RefreshCw, Settings, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts } from '@/data/products';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
  const { user, isAuthenticated, updatePassword, updatePhone, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Schemas for settings forms
  const passwordSchema = z.object({
    currentPassword: z.string().min(8, t.dashboard.currentPassword + ' ' + t.auth?.errors?.passwordMin || 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, t.dashboard.newPassword + ' ' + t.auth?.errors?.passwordMin || 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, t.dashboard.confirmPassword + ' ' + t.auth?.errors?.passwordMin || 'Password must be at least 8 characters'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const phoneSchema = z.object({
    phone: z.string().min(10, 'Please enter a valid phone number'),
  });

  type PasswordFormValues = z.infer<typeof passwordSchema>;
  type PhoneFormValues = z.infer<typeof phoneSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: user?.phone || '' },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    try {
      const result = await updatePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        toast({
          title: t.dashboard.passwordChanged,
          description: t.dashboard.passwordChanged,
        });
        passwordForm.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsPhoneLoading(true);
    try {
      const result = await updatePhone(data.phone);
      if (result.success) {
        toast({
          title: t.dashboard.phoneChanged,
          description: t.dashboard.phoneChanged,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update phone",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const stats = [
    { label: t.dashboard.active, value: 2, color: 'bg-sage' },
    { label: t.dashboard.pending, value: 1, color: 'bg-primary' },
    { label: t.dashboard.sold, value: 5, color: 'bg-muted' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t.dashboard.title}
            </h1>
            <p className="text-muted-foreground">
              {t.auth?.welcomeBack || 'Welcome back'}, {user?.firstName} {user?.lastName}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>
              {t.nav.login === 'Login' ? 'Logout' : t.nav.login === 'Daxil Ol' ? 'Çıxış' : 'Выход'}
            </Button>
            <Link to="/upload">
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                {t.nav.upload}
              </Button>
            </Link>
          </div>
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
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.settings}</span>
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Change Password */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  {t.dashboard.changePassword}
                </h3>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t.dashboard.currentPassword}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isPasswordLoading}
                        className={cn(passwordForm.formState.errors.currentPassword && "border-destructive")}
                        {...passwordForm.register("currentPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t.dashboard.newPassword}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isPasswordLoading}
                        className={cn(passwordForm.formState.errors.newPassword && "border-destructive")}
                        {...passwordForm.register("newPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.dashboard.confirmPassword}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      disabled={isPasswordLoading}
                      className={cn(passwordForm.formState.errors.confirmPassword && "border-destructive")}
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isPasswordLoading}>
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      t.dashboard.save
                    )}
                  </Button>
                </form>
              </div>

              {/* Change Phone Number */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  {t.dashboard.changePhone}
                </h3>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.dashboard.phoneNumber}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+994 XX XXX XX XX"
                      disabled={isPhoneLoading}
                      className={cn(phoneForm.formState.errors.phone && "border-destructive")}
                      {...phoneForm.register("phone")}
                    />
                    {phoneForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isPhoneLoading}>
                    {isPhoneLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      t.dashboard.save
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
