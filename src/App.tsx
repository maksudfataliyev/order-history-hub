import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { CartProvider } from "@/contexts/CartContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { SalesProvider } from "@/contexts/SalesContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import AuthPage from "./pages/Auth";
import Shipping from "./pages/Shipping";
import Checkout from "./pages/Checkout";
import ForgotPassword from "./pages/ForgotPassword";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <ListingsProvider>
              <SalesProvider>
                <CompareProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </CompareProvider>
              </SalesProvider>
            </ListingsProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
