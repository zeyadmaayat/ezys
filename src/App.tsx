import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import TopicDetail from "./pages/TopicDetail";
import Search from "./pages/Search";
import Tools from "./pages/Tools";
import Admin from "./pages/Admin";
import LogisticsAssistant from "./pages/LogisticsAssistant";
import MyShipments from "./pages/MyShipments";
import ShipmentDetail from "./pages/ShipmentDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - only auth pages */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/category/:slug" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
              <Route path="/category/:categorySlug/topic/:topicSlug" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
              <Route path="/logistics-assistant" element={<ProtectedRoute><LogisticsAssistant /></ProtectedRoute>} />
              <Route path="/shipments" element={<ProtectedRoute><MyShipments /></ProtectedRoute>} />
              <Route path="/shipments/:id" element={<ProtectedRoute><ShipmentDetail /></ProtectedRoute>} />
              
              {/* Admin routes - require admin role */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              
              {/* 404 - also protected */}
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
