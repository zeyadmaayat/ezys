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
import ResetPassword from "./pages/ResetPassword";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import TopicDetail from "./pages/TopicDetail";
import Search from "./pages/Search";
import Tools from "./pages/Tools";
import Admin from "./pages/Admin";
import LogisticsAssistant from "./pages/LogisticsAssistant";
import MyShipments from "./pages/MyShipments";
import ShipmentDetail from "./pages/ShipmentDetail";
import OpsDashboard from "./pages/OpsDashboard";
import NotFound from "./pages/NotFound";
// ERP Pages
import CustomersPage from "./pages/erp/Customers";
import LocationsPage from "./pages/erp/Locations";
import ItemsPage from "./pages/erp/Items";
import OrdersPage from "./pages/erp/Orders";
import InventoryPage from "./pages/erp/Inventory";
import InvoicesPage from "./pages/erp/Invoices";
import WorkflowCheckPage from "./pages/erp/WorkflowCheck";
import RequisitionsPage from "./pages/erp/Requisitions";
import PurchaseOrdersPage from "./pages/erp/PurchaseOrders";
import ProcurementDashboard from "./pages/erp/ProcurementDashboard";
import ReturnOrdersPage from "./pages/erp/ReturnOrders";
import BlanketOrdersPage from "./pages/erp/BlanketOrders";
import GoodsReceiptsPage from "./pages/erp/GoodsReceipts";
import GoodsReceiptNewPage from "./pages/erp/GoodsReceiptNew";
import GoodsReceiptDetailPage from "./pages/erp/GoodsReceiptDetail";
// SaaS ERP Pages
import CompanySetup from "./pages/saas/CompanySetup";
import SaaSDashboard from "./pages/saas/Dashboard";
import SaaSShipments from "./pages/saas/Shipments";
import SaaSClients from "./pages/saas/Clients";
import SaaSWarehouses from "./pages/saas/Warehouses";
import SaaSInvoices from "./pages/saas/Invoices";
import RoleManagement from "./pages/saas/RoleManagement";
import AuditLog from "./pages/saas/AuditLog";
// Finance Pages
import ExpensesPage from "./pages/finance/Expenses";
import ReportsPage from "./pages/finance/Reports";
import ThreeWayMatchPage from "./pages/finance/ThreeWayMatch";
import StatementsPage from "./pages/finance/Statements";
// Domestic Pro Pages
import DpDashboard from "./pages/dp/Dashboard";
import DpShipments from "./pages/dp/Shipments";
import DpDrivers from "./pages/dp/Drivers";
import DpWarehouse from "./pages/dp/Warehouse";
import DpInventoryPage from "./pages/dp/Inventory";
import DpCodSettlements from "./pages/dp/CodSettlements";
import DpRiskDashboard from "./pages/dp/RiskDashboard";
// Sales / CRM Pages
import SalesDashboard from "./pages/sales/Dashboard";
import SalesLeads from "./pages/sales/Leads";
import SalesPipeline from "./pages/sales/Pipeline";
import SalesQuotations from "./pages/sales/Quotations";
import SalesOrders from "./pages/sales/Orders";
import SalesCustomers from "./pages/sales/Customers";

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
              
              {/* ERP Module Routes */}
              <Route path="/erp/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
              <Route path="/erp/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
              <Route path="/erp/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
              <Route path="/erp/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/erp/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
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
              <Route path="/sales/leads" element={<ProtectedRoute><SalesLeads /></ProtectedRoute>} />
              <Route path="/sales/pipeline" element={<ProtectedRoute><SalesPipeline /></ProtectedRoute>} />
              <Route path="/sales/quotations" element={<ProtectedRoute><SalesQuotations /></ProtectedRoute>} />
              <Route path="/sales/orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
              <Route path="/sales/customers" element={<ProtectedRoute><SalesCustomers /></ProtectedRoute>} />
              
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
