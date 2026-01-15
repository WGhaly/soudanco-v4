import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import NewCustomer from "./pages/NewCustomer";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import PriceLists from "./pages/PriceLists";
import PriceListDetails from "./pages/PriceListDetails";
import AddPriceList from "./pages/AddPriceList";
import Discounts from "./pages/Discounts";
import AddDiscount from "./pages/AddDiscount";
import DiscountDetails from "./pages/DiscountDetails";
import Payments from "./pages/Payments";
import PaymentDetails from "./pages/PaymentDetails";
import Supervisors from "./pages/Supervisors";
import SupervisorDetails from "./pages/SupervisorDetails";
import EditSupervisor from "./pages/EditSupervisor";
import RolePermissions from "./pages/RolePermissions";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={['admin', 'supervisor']}>
      {children}
    </RequireAuth>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/customers/new" element={<ProtectedRoute><NewCustomer /></ProtectedRoute>} />
              <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
              <Route path="/customers/:id/edit" element={<ProtectedRoute><NewCustomer /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/products/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
              <Route path="/products/:id/edit" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
              <Route path="/price-lists" element={<ProtectedRoute><PriceLists /></ProtectedRoute>} />
              <Route path="/price-lists/add" element={<ProtectedRoute><AddPriceList /></ProtectedRoute>} />
              <Route path="/price-lists/:id" element={<ProtectedRoute><PriceListDetails /></ProtectedRoute>} />
              <Route path="/price-lists/:id/edit" element={<ProtectedRoute><AddPriceList /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />
              <Route path="/discounts" element={<ProtectedRoute><Discounts /></ProtectedRoute>} />
              <Route path="/discounts/add" element={<ProtectedRoute><AddDiscount /></ProtectedRoute>} />
              <Route path="/discounts/:id" element={<ProtectedRoute><DiscountDetails /></ProtectedRoute>} />
              <Route path="/discounts/:id/edit" element={<ProtectedRoute><AddDiscount /></ProtectedRoute>} />
              <Route path="/supervisors" element={<ProtectedRoute><Supervisors /></ProtectedRoute>} />
              <Route path="/supervisors/new" element={<ProtectedRoute><EditSupervisor /></ProtectedRoute>} />
              <Route path="/supervisors/:id" element={<ProtectedRoute><SupervisorDetails /></ProtectedRoute>} />
              <Route path="/supervisors/:id/edit" element={<ProtectedRoute><EditSupervisor /></ProtectedRoute>} />
              <Route path="/supervisors/:id/permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
              <Route path="/logout" element={<Navigate to="/login" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
