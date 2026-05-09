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
const LogisticsAssistant = lazy(() => import("./pages/LogisticsAssistant"));
const MyShipments = lazy(() => import("./pages/MyShipments"));
const ShipmentDetail = lazy(() => import("./pages/ShipmentDetail"));
const OpsDashboard = lazy(() => import("./pages/OpsDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));

// ERP
const CustomersPage = lazy(() => import("./pages/erp/Customers"));
const LocationsPage = lazy(() => import("./pages/erp/Locations"));
const ItemsPage = lazy(() => import("./pages/erp/Items"));
const OrdersPage = lazy(() => import("./pages/erp/Orders"));
const InventoryPage = lazy(() => import("./pages/erp/Inventory"));
const InventoryDashboard = lazy(() => import("./pages/erp/InventoryDashboard"));
const InventoryAdvanced = lazy(() => import("./pages/erp/InventoryAdvanced"));
const InvoicesPage = lazy(() => import("./pages/erp/Invoices"));
const WorkflowCheckPage = lazy(() => import("./pages/erp/WorkflowCheck"));
const RequisitionsPage = lazy(() => import("./pages/erp/Requisitions"));
const PurchaseOrdersPage = lazy(() => import("./pages/erp/PurchaseOrders"));
const ProcurementDashboard = lazy(() => import("./pages/erp/ProcurementDashboard"));
const ReturnOrdersPage = lazy(() => import("./pages/erp/ReturnOrders"));
const BlanketOrdersPage = lazy(() => import("./pages/erp/BlanketOrders"));
const GoodsReceiptsPage = lazy(() => import("./pages/erp/GoodsReceipts"));
const GoodsReceiptNewPage = lazy(() => import("./pages/erp/GoodsReceiptNew"));
const GoodsReceiptDetailPage = lazy(() => import("./pages/erp/GoodsReceiptDetail"));

// SaaS
const CompanySetup = lazy(() => import("./pages/saas/CompanySetup"));
const SaaSDashboard = lazy(() => import("./pages/saas/Dashboard"));
const SaaSShipments = lazy(() => import("./pages/saas/Shipments"));
const SaaSClients = lazy(() => import("./pages/saas/Clients"));
const SaaSWarehouses = lazy(() => import("./pages/saas/Warehouses"));
const SaaSInvoices = lazy(() => import("./pages/saas/Invoices"));
const RoleManagement = lazy(() => import("./pages/saas/RoleManagement"));
const AuditLog = lazy(() => import("./pages/saas/AuditLog"));

// Finance
const ExpensesPage = lazy(() => import("./pages/finance/Expenses"));
const ReportsPage = lazy(() => import("./pages/finance/Reports"));
const ThreeWayMatchPage = lazy(() => import("./pages/finance/ThreeWayMatch"));
const StatementsPage = lazy(() => import("./pages/finance/Statements"));

// Domestic Pro
const DpDashboard = lazy(() => import("./pages/dp/Dashboard"));
const DpShipments = lazy(() => import("./pages/dp/Shipments"));
const DpDrivers = lazy(() => import("./pages/dp/Drivers"));
const DpWarehouse = lazy(() => import("./pages/dp/Warehouse"));
const DpInventoryPage = lazy(() => import("./pages/dp/Inventory"));
const DpCodSettlements = lazy(() => import("./pages/dp/CodSettlements"));
const DpRiskDashboard = lazy(() => import("./pages/dp/RiskDashboard"));

// Sales / CRM
const SalesDashboard = lazy(() => import("./pages/sales/Dashboard"));
const SalesLeads = lazy(() => import("./pages/sales/Leads"));
const SalesPipeline = lazy(() => import("./pages/sales/Pipeline"));
const SalesQuotations = lazy(() => import("./pages/sales/Quotations"));
const SalesOrders = lazy(() => import("./pages/sales/Orders"));
const SalesCustomers = lazy(() => import("./pages/sales/Customers"));
const SalesProducts = lazy(() => import("./pages/sales/Products"));
const SalesReports = lazy(() => import("./pages/sales/Reports"));

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

                {/* Protected routes - require authentication */}
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/category/:slug" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
                <Route path="/category/:categorySlug/topic/:topicSlug" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
                <Route path="/logistics-assistant" element={<ProtectedRoute><LogisticsAssistant /></ProtectedRoute>} />
                <Route path="/shipments" element={<ProtectedRoute><MyShipments /></ProtectedRoute>} />
                <Route path="/shipments/:id" element={<ProtectedRoute><ShipmentDetail /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><OpsDashboard /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />

                {/* ERP Module Routes */}
                <Route path="/erp/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/erp/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
                <Route path="/erp/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
                <Route path="/erp/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/erp/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                <Route path="/erp/inventory/dashboard" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
                <Route path="/erp/inventory/transfers" element={<ProtectedRoute><InventoryAdvanced /></ProtectedRoute>} />
                <Route path="/erp/inventory/cycle-count" element={<ProtectedRoute><InventoryAdvanced /></ProtectedRoute>} />
                <Route path="/erp/inventory/reorder" element={<ProtectedRoute><InventoryAdvanced /></ProtectedRoute>} />
                <Route path="/erp/inventory/batches" element={<ProtectedRoute><InventoryAdvanced /></ProtectedRoute>} />
                <Route path="/erp/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                <Route path="/erp/workflow-check" element={<ProtectedRoute><WorkflowCheckPage /></ProtectedRoute>} />
                <Route path="/erp/procurement" element={<ProtectedRoute><ProcurementDashboard /></ProtectedRoute>} />
                <Route path="/erp/requisitions" element={<ProtectedRoute><RequisitionsPage /></ProtectedRoute>} />
                <Route path="/erp/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
                <Route path="/erp/return-orders" element={<ProtectedRoute><ReturnOrdersPage /></ProtectedRoute>} />
                <Route path="/erp/blanket-orders" element={<ProtectedRoute><BlanketOrdersPage /></ProtectedRoute>} />
                <Route path="/erp/receipts" element={<ProtectedRoute><GoodsReceiptsPage /></ProtectedRoute>} />
                <Route path="/erp/receipts/new" element={<ProtectedRoute><GoodsReceiptNewPage /></ProtectedRoute>} />
                <Route path="/erp/receipts/:id" element={<ProtectedRoute><GoodsReceiptDetailPage /></ProtectedRoute>} />

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
                <Route path="/saas/audit-log" element={<AdminRoute><AuditLog /></AdminRoute>} />

                {/* Domestic Pro Routes */}
                <Route path="/dp" element={<ProtectedRoute><DpDashboard /></ProtectedRoute>} />
                <Route path="/dp/shipments" element={<ProtectedRoute><DpShipments /></ProtectedRoute>} />
                <Route path="/dp/drivers" element={<ProtectedRoute><DpDrivers /></ProtectedRoute>} />
                <Route path="/dp/warehouse" element={<ProtectedRoute><DpWarehouse /></ProtectedRoute>} />
                <Route path="/dp/inventory" element={<ProtectedRoute><DpInventoryPage /></ProtectedRoute>} />
                <Route path="/dp/cod" element={<ProtectedRoute><DpCodSettlements /></ProtectedRoute>} />
                <Route path="/dp/risk" element={<ProtectedRoute><DpRiskDashboard /></ProtectedRoute>} />

                {/* Sales / CRM Routes */}
                <Route path="/sales/dashboard" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
                <Route path="/sales/products" element={<ProtectedRoute><SalesProducts /></ProtectedRoute>} />
                <Route path="/sales/leads" element={<ProtectedRoute><SalesLeads /></ProtectedRoute>} />
                <Route path="/sales/pipeline" element={<ProtectedRoute><SalesPipeline /></ProtectedRoute>} />
                <Route path="/sales/quotations" element={<ProtectedRoute><SalesQuotations /></ProtectedRoute>} />
                <Route path="/sales/orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
                <Route path="/sales/customers" element={<ProtectedRoute><SalesCustomers /></ProtectedRoute>} />
                <Route path="/sales/reports" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />

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
