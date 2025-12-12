import { useState, useEffect, useRef } from 'react';
import { Package, MessageSquare, RefreshCw, Settings, Plus, Eye, EyeOff, Loader2, Camera, ShoppingBag, ClipboardList, MapPin, Check, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { useOrders, Order } from '@/contexts/OrderContext';
import { useListings, ListingStatus } from '@/contexts/ListingsContext';
import { useOffers } from '@/contexts/OffersContext';
import { OrderDetailDialog } from '@/components/OrderDetailDialog';
import { mockProducts } from '@/data/products';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const myListings = mockProducts.slice(0, 3).map((p, i) => ({
  ...p,
  status: i === 0 ? 'active' : i === 1 ? 'pending' : 'sold',
}));

const mockMessages = [
  { id: '1', from: 'Anar M.', message: 'Is the sofa still available?', time: '2h ago', unread: true },
  { id: '2', from: 'Leyla H.', message: 'Would you accept a trade for...', time: '1d ago', unread: false },
  { id: '3', from: 'Rashad K.', message: 'Thank you for the quick delivery!', time: '3d ago', unread: false },
];


const Dashboard = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, updatePassword, updatePhone, updateProfile, updateAvatar, updateAddress, logout } = useAuth();
  const { getOrdersByUser } = useOrders();
  const { getListingsByUser } = useListings();
  const { getOffersBySeller, acceptOffer, declineOffer, counterOffer } = useOffers();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userOrders = getOrdersByUser();
  const userListings = getListingsByUser();
  const sellerOffers = getOffersBySeller();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'listings');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      placed: (t.dashboard.orderStatus as Record<string, string>)?.placed || 'Placed',
      confirmed: (t.dashboard.orderStatus as Record<string, string>)?.confirmed || 'Confirmed',
      shipped: (t.dashboard.orderStatus as Record<string, string>)?.shipped || 'Shipped',
      outForDelivery: (t.dashboard.orderStatus as Record<string, string>)?.outForDelivery || 'Out for Delivery',
      delivered: (t.dashboard.orderStatus as Record<string, string>)?.delivered || 'Delivered',
    };
    return statusMap[status] || status;
  };

  const getListingStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      active: t.dashboard.active as string,
      pending: t.dashboard.pending as string,
      sold: t.dashboard.sold as string,
    };
    return statusLabels[status] || status;
  };

  const getUploadedListingStatusLabel = (status: ListingStatus) => {
    const statusLabels: Record<ListingStatus, string> = {
      pending_review: t.listings?.status?.pending_review || 'Under Review',
      approved: t.listings?.status?.approved || 'Approved',
      rejected: t.listings?.status?.rejected || 'Rejected',
      active: t.listings?.status?.active || 'Active',
      sold: t.listings?.status?.sold || 'Sold',
    };
    return statusLabels[status] || status;
  };

  const getUploadedListingStatusColor = (status: ListingStatus) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-destructive/20 text-destructive';
      case 'active': return 'bg-sage text-sage-dark';
      case 'sold': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAvatarLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await updateAvatar(base64);
        if (result.success) {
          toast({ title: t.dashboard.avatarChanged });
        }
        setIsAvatarLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsAvatarLoading(false);
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const handleAcceptOffer = (offerId: string) => {
    acceptOffer(offerId);
    alert('Offer accepted and added to sales!');
  };

  const handleDeclineOffer = (offerId: string) => {
    declineOffer(offerId);
    alert('Offer declined');
  };

  const handleCounterOfferSubmit = (offerId: string) => {
    if (counterPriceInput) {
      counterOffer(offerId, parseFloat(counterPriceInput));
      alert(`Counter offer of ₼${counterPriceInput} sent!`);
      setCounterOfferId(null);
      setCounterPriceInput('');
    }
  };

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
    phone: z.string()
      .min(7, t.auth?.errors?.phoneMinLength || 'Phone must be at least 7 digits')
      .max(15, t.auth?.errors?.phoneMaxLength || 'Phone cannot exceed 15 digits')
      .regex(/^\+?[0-9]+$/, t.auth?.errors?.phoneOnlyNumbers || 'Only numbers allowed'),
  });

  const profileSchema = z.object({
    firstName: z.string().min(2, t.auth?.errors?.firstNameMin || 'First name must be at least 2 characters'),
    lastName: z.string().min(2, t.auth?.errors?.lastNameMin || 'Last name must be at least 2 characters'),
  });

  const addressSchema = z.object({
    street: z.string().min(5, 'Street must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    addressDetails: z.string().optional(),
    zipCode: z.string().optional(),
  });

  type PasswordFormValues = z.infer<typeof passwordSchema>;
  type PhoneFormValues = z.infer<typeof phoneSchema>;
  type ProfileFormValues = z.infer<typeof profileSchema>;
  type AddressFormValues = z.infer<typeof addressSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: user?.phone || '' },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { 
      street: user?.address?.street || '', 
      city: user?.address?.city || '',
      addressDetails: user?.address?.addressDetails || '',
      zipCode: user?.address?.zipCode || '',
    },
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

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const result = await updateProfile({ firstName: data.firstName, lastName: data.lastName });
      if (result.success) {
        toast({
          title: t.dashboard.profileChanged,
          description: t.dashboard.profileChanged,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onAddressSubmit = async (data: AddressFormValues) => {
    setIsAddressLoading(true);
    try {
      const result = await updateAddress({
        street: data.street,
        city: data.city,
        addressDetails: data.addressDetails,
        zipCode: data.zipCode,
      });
      if (result.success) {
        toast({
          title: t.dashboard.profileChanged,
          description: 'Address updated successfully',
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update address",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddressLoading(false);
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarLoading}
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                {isAvatarLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                {t.dashboard.title}
              </h1>
              <p className="text-muted-foreground">
                {t.auth?.welcomeBack || 'Welcome back'}, {user?.firstName} {user?.lastName}!
              </p>
              {user?.createdAt && (
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.memberSince}: {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>
              {t.nav.logout}
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
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.myListings}</span>
            </TabsTrigger>
            <TabsTrigger value="mylistings" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">{t.listings?.title || 'My Uploads'}</span>
              {userListings.length > 0 && (
                <Badge className="ml-1 bg-yellow-100 text-yellow-700">{userListings.length}</Badge>
              )}
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
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard.orders}</span>
              {userOrders.length > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground">{userOrders.length}</Badge>
              )}
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
                    {getListingStatusLabel(listing.status)}
                  </Badge>
                  <Link to={`/product/${listing.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* My Uploads Tab */}
          <TabsContent value="mylistings" className="mt-6">
            {userListings.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t.listings?.noListings || 'No listings yet'}</p>
                <Link to="/upload">
                  <Button variant="hero">{t.listings?.uploadFirst || 'Add your first furniture'}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 bg-card border border-border rounded-xl"
                  >
                    <div className="flex items-start gap-4">
                      {listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.name} className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground">₼{listing.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.listings?.uploadedAt || 'Uploaded'}: {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getUploadedListingStatusColor(listing.status)}>
                        {getUploadedListingStatusLabel(listing.status)}
                      </Badge>
                    </div>
                    {listing.reviewNote && (
                      <p className="mt-3 text-sm text-muted-foreground bg-muted p-2 rounded">
                        Note: {listing.reviewNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            {sellerOffers.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No offers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellerOffers.map((offer) => (
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
                          offer.status === 'accepted' && 'bg-sage text-sage-dark',
                          offer.status === 'declined' && 'bg-destructive/20 text-destructive',
                          offer.status === 'countered' && 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {offer.status}
                      </Badge>
                    </div>
                    {offer.status === 'pending' && (
                      <>
                        <div className="flex gap-2">
                          <Button variant="hero" size="sm" className="gap-1" onClick={() => handleAcceptOffer(offer.id)}>
                            <Check className="w-3 h-3" />
                            Accept
                          </Button>
                          <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDeclineOffer(offer.id)}>
                            <X className="w-3 h-3" />
                            Decline
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCounterOfferId(counterOfferId === offer.id ? null : offer.id)}
                          >
                            Counter
                          </Button>
                        </div>
                        {counterOfferId === offer.id && (
                          <div className="mt-3 flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Enter counter price"
                              value={counterPriceInput}
                              onChange={(e) => setCounterPriceInput(e.target.value)}
                              className="w-40"
                            />
                            <Button size="sm" onClick={() => handleCounterOfferSubmit(offer.id)}>
                              Send
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            {userOrders.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.dashboard.noOrders}</p>
                <Link to="/catalog">
                  <Button variant="outline" className="mt-4">
                    {t.compare?.browseCatalog || 'Browse Catalog'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{order.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t.checkout?.orderNumber || 'Order'}: #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-primary">₼{order.total}</p>
                        <Badge
                          className={cn(
                            order.status === 'placed' && 'bg-primary/20 text-primary',
                            order.status === 'confirmed' && 'bg-blue-100 text-blue-700',
                            order.status === 'shipped' && 'bg-yellow-100 text-yellow-700',
                            order.status === 'outForDelivery' && 'bg-orange-100 text-orange-700',
                            order.status === 'delivered' && 'bg-sage text-sage-dark'
                          )}
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {t.dashboard?.clickToView || 'Click to view details'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <OrderDetailDialog
            order={selectedOrder}
            open={!!selectedOrder}
            onOpenChange={(open) => !open && setSelectedOrder(null)}
          />

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

              {/* Change Name */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  {t.dashboard.changeName}
                </h3>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t.auth?.firstName || 'First Name'}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      disabled={isProfileLoading}
                      className={cn(profileForm.formState.errors.firstName && "border-destructive")}
                      {...profileForm.register("firstName")}
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t.auth?.lastName || 'Last Name'}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      disabled={isProfileLoading}
                      className={cn(profileForm.formState.errors.lastName && "border-destructive")}
                      {...profileForm.register("lastName")}
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isProfileLoading}>
                    {isProfileLoading ? (
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

              {/* Address */}
              <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {t.auth?.street || 'Address'}
                  </h3>
                </div>
                {user?.address ? (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">{user.address.street}</p>
                    <p className="text-sm text-muted-foreground">{user.address.city}{user.address.zipCode && `, ${user.address.zipCode}`}</p>
                    {user.address.addressDetails && <p className="text-sm text-muted-foreground">{user.address.addressDetails}</p>}
                  </div>
                ) : null}
                <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t.checkout?.city || 'City'}</Label>
                      <Input id="city" placeholder="Baku" disabled={isAddressLoading} {...addressForm.register("city")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">{t.auth?.zipCode || 'Zip Code'}</Label>
                      <Input id="zipCode" placeholder="AZ1000" disabled={isAddressLoading} {...addressForm.register("zipCode")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">{t.auth?.street || 'Street'}</Label>
                    <Input id="street" placeholder="Street, house, apartment" disabled={isAddressLoading} {...addressForm.register("street")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressDetails">{t.auth?.addressDetails || 'Details'}</Label>
                    <Input id="addressDetails" placeholder="Additional details" disabled={isAddressLoading} {...addressForm.register("addressDetails")} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isAddressLoading}>
                    {isAddressLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : t.dashboard.save}
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
