import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Loader2 } from "lucide-react";

// Eager: landing + auth (instant first paint)
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy: everything else (massive bundle savings)
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const TopicDetail = lazy(() => import("./pages/TopicDetail"));
const Search = lazy(() => import("./pages/Search"));
const Tools = lazy(() => import("./pages/Tools"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// SaaS
const CompanySetup = lazy(() => import("./pages/saas/CompanySetup"));
const SaaSDashboard = lazy(() => import("./pages/saas/Dashboard"));
const SaaSShipments = lazy(() => import("./pages/saas/Shipments"));
const SaaSClients = lazy(() => import("./pages/saas/Clients"));
const SaaSWarehouses = lazy(() => import("./pages/saas/Warehouses"));
const SaaSInvoices = lazy(() => import("./pages/saas/Invoices"));
const RoleManagement = lazy(() => import("./pages/saas/RoleManagement"));
const FieldPermissions = lazy(() => import("./pages/saas/FieldPermissions"));
const AuditLog = lazy(() => import("./pages/saas/AuditLog"));
const ComplianceCenter = lazy(() => import("./pages/saas/ComplianceCenter"));
const DevelopersPage = lazy(() => import("./pages/saas/Developers"));

// Finance
const ExpensesPage = lazy(() => import("./pages/finance/Expenses"));
const ReportsPage = lazy(() => import("./pages/finance/Reports"));
const ThreeWayMatchPage = lazy(() => import("./pages/finance/ThreeWayMatch"));
const StatementsPage = lazy(() => import("./pages/finance/Statements"));

// Floating widget — keep eager (small, used everywhere)
import { AiAssistantFloating } from "@/components/ai/AiAssistantFloating";
import LumieroBadge from "@/components/LumieroBadge";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // 1 min — avoid refetch storms
      gcTime: 5 * 60_000,       // 5 min cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public routes - only auth pages */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* OAuth consent route (public — handles its own auth redirect) */}
                <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

                {/* Protected routes - require authentication */}
                <Route path="/" element={<Index />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/category/:slug" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
                <Route path="/category/:categorySlug/topic/:topicSlug" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />


                {/* SaaS ERP Routes */}
                <Route path="/saas/setup" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
                <Route path="/saas/dashboard" element={<ProtectedRoute><SaaSDashboard /></ProtectedRoute>} />
                <Route path="/saas/shipments" element={<ProtectedRoute><SaaSShipments /></ProtectedRoute>} />
                <Route path="/saas/clients" element={<ProtectedRoute><SaaSClients /></ProtectedRoute>} />
                <Route path="/saas/warehouses" element={<ProtectedRoute><SaaSWarehouses /></ProtectedRoute>} />
                <Route path="/saas/invoices" element={<ProtectedRoute><SaaSInvoices /></ProtectedRoute>} />
                <Route path="/finance/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/finance/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/finance/three-way-match" element={<ProtectedRoute><ThreeWayMatchPage /></ProtectedRoute>} />
                <Route path="/finance/statements" element={<ProtectedRoute><StatementsPage /></ProtectedRoute>} />
                <Route path="/saas/roles" element={<AdminRoute><RoleManagement /></AdminRoute>} />
                <Route path="/saas/field-permissions" element={<AdminRoute><FieldPermissions /></AdminRoute>} />
                <Route path="/saas/audit-log" element={<AdminRoute><AuditLog /></AdminRoute>} />
                <Route path="/saas/compliance" element={<AdminRoute><ComplianceCenter /></AdminRoute>} />
                <Route path="/saas/developers" element={<AdminRoute><DevelopersPage /></AdminRoute>} />

                {/* Admin routes - require admin role */}
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

                {/* 404 - also protected */}
                <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              </Routes>
            </Suspense>
            <AiAssistantFloating />
            <LumieroBadge />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
