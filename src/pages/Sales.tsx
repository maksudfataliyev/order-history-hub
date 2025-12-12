import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Calendar, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSales, Sale } from '@/contexts/SalesContext';
import { cn } from '@/lib/utils';

const Sales = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { getSalesByUser, getSalesByPeriod } = useSales();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const sales = period === 'all' ? getSalesByUser() : getSalesByPeriod(period as 'week' | 'month' | 'year');

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const confirmedOrders = sales.filter(s => s.status === 'confirmed' || s.status === 'shipped' || s.status === 'delivered').length;

  const getStatusLabel = (status: Sale['status']) => {
    const labels: Record<string, string> = {
      confirmed: t.sales?.confirmed || 'Confirmed',
      shipped: t.sales?.shipped || 'Shipped',
      delivered: t.sales?.delivered || 'Delivered',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-sage text-sage-dark';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              {t.sales?.title || 'My Sales'}
            </h1>
            <p className="text-muted-foreground">
              {t.sales?.subtitle || 'Track your sales and revenue'}
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.sales?.allTime || 'All Time'}</SelectItem>
              <SelectItem value="week">{t.sales?.thisWeek || 'This Week'}</SelectItem>
              <SelectItem value="month">{t.sales?.thisMonth || 'This Month'}</SelectItem>
              <SelectItem value="year">{t.sales?.thisYear || 'This Year'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.totalRevenue || 'Total Revenue'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">₼{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-sage-dark" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.totalOrders || 'Total Orders'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{totalOrders}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sage-dark" />
              </div>
              <span className="text-sm text-muted-foreground">{t.sales?.confirmed || 'Confirmed'}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{confirmedOrders}</p>
          </div>
        </div>

        {/* Sales List */}
        {sales.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {t.sales?.noSales || 'No sales yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t.sales?.noSalesDesc || 'When someone buys your furniture, it will appear here.'}
            </p>
            <Button onClick={() => navigate('/upload')} variant="hero">
              {t.nav?.upload || 'List Furniture'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
              <div className="col-span-4">{t.sales?.product || 'Product'}</div>
              <div className="col-span-2">{t.sales?.buyer || 'Buyer'}</div>
              <div className="col-span-2">{t.sales?.date || 'Date'}</div>
              <div className="col-span-2">{t.sales?.amount || 'Amount'}</div>
              <div className="col-span-2">{t.sales?.status || 'Status'}</div>
            </div>
            
            {sales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
                className={cn(
                  "bg-card border rounded-xl p-4 cursor-pointer transition-all",
                  selectedSale?.id === sale.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                )}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                    <img
                      src={sale.productImage}
                      alt={sale.productName}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{sale.productName}</h4>
                      <p className="text-sm text-muted-foreground md:hidden">
                        {sale.buyerName} • {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block col-span-2 text-foreground">{sale.buyerName}</div>
                  <div className="hidden md:block col-span-2 text-muted-foreground text-sm">
                    {formatDate(sale.createdAt)}
                  </div>
                  <div className="col-span-6 md:col-span-2 font-display font-semibold text-primary">
                    ₼{sale.total.toFixed(2)}
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-center justify-end md:justify-start gap-2">
                    <Badge className={getStatusColor(sale.status)}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedSale?.id === sale.id && (
                  <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-foreground mb-2">
                        {t.sales?.buyerInfo || 'Buyer Information'}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">{t.auth?.email || 'Email'}:</span> {sale.buyerEmail}</p>
                        <p><span className="text-muted-foreground">{t.checkout?.city || 'City'}:</span> {sale.buyerAddress.city}</p>
                        <p><span className="text-muted-foreground">{t.checkout?.street || 'Street'}:</span> {sale.buyerAddress.street}</p>
                        {sale.buyerAddress.addressDetails && (
                          <p><span className="text-muted-foreground">{t.auth?.addressDetails || 'Details'}:</span> {sale.buyerAddress.addressDetails}</p>
                        )}
                        {sale.buyerAddress.zipCode && (
                          <p><span className="text-muted-foreground">{t.auth?.zipCode || 'Zip'}:</span> {sale.buyerAddress.zipCode}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-2">
                        {t.sales?.orderDetails || 'Order Details'}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">{t.sales?.orderId || 'Order ID'}:</span> #{sale.id.slice(0, 8).toUpperCase()}</p>
                        <p><span className="text-muted-foreground">{t.sales?.product || 'Product'}:</span> ₼{sale.productPrice.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">{t.checkout?.shipping || 'Shipping'}:</span> ₼{sale.shippingPrice.toFixed(2)}</p>
                        <p className="font-semibold"><span className="text-muted-foreground">{t.checkout?.total || 'Total'}:</span> ₼{sale.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
