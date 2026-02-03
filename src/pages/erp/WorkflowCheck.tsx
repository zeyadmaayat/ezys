import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2, ArrowRight, Play } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useLocations } from '@/hooks/useLocations';
import { useItems } from '@/hooks/useItems';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface StepResult {
  status: StepStatus;
  message?: string;
  id?: string;
}

const WorkflowCheck = () => {
  const { customers, createCustomer, refetch: refetchCustomers } = useCustomers();
  const { locations, createLocation, refetch: refetchLocations } = useLocations();
  const { items, createItem, refetch: refetchItems } = useItems();
  const { orders, createOrder, updateOrderStatus, convertToShipment, refetch: refetchOrders } = useOrders();
  const { adjustInventory, refetch: refetchInventory } = useInventory();
  const { createInvoice, updateInvoiceStatus, refetch: refetchInvoices } = useInvoices();

  const [steps, setSteps] = useState<Record<string, StepResult>>({
    customer: { status: 'pending' },
    warehouse: { status: 'pending' },
    delivery: { status: 'pending' },
    item: { status: 'pending' },
    order: { status: 'pending' },
    confirm: { status: 'pending' },
    shipment: { status: 'pending' },
    inventory: { status: 'pending' },
    invoice: { status: 'pending' },
  });

  const updateStep = (key: string, result: StepResult) => {
    setSteps(prev => ({ ...prev, [key]: result }));
  };

  // Step A: Create sample customer
  const runStepCustomer = async () => {
    updateStep('customer', { status: 'running' });
    try {
      // Look for existing test customer first
      const testCustomer = customers.find(c => c.name.startsWith('Test '));
      if (testCustomer) {
        updateStep('customer', { 
          status: 'done', 
          message: `Using existing: ${testCustomer.name}`,
          id: testCustomer.id 
        });
        return testCustomer.id;
      }
      
      // Use any customer if no test customer
      if (customers.length > 0) {
        updateStep('customer', { 
          status: 'done', 
          message: `Using existing customer: ${customers[0].name}`,
          id: customers[0].id 
        });
        return customers[0].id;
      }
      
      const customer = await createCustomer({
        name: 'Test Customer LLC',
        email: 'test@example.com',
        phone: '+966500000001',
      });
      
      if (customer) {
        await refetchCustomers();
        updateStep('customer', { 
          status: 'done', 
          message: `Created: ${customer.name}`,
          id: customer.id 
        });
        return customer.id;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      updateStep('customer', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step B: Create warehouse location
  const runStepWarehouse = async () => {
    updateStep('warehouse', { status: 'running' });
    try {
      // Look for existing test warehouse first
      const existingWarehouse = locations.find(l => 
        l.name.startsWith('Test ') && l.location_type === 'warehouse'
      ) || locations.find(l => l.location_type === 'warehouse');
      if (existingWarehouse) {
        updateStep('warehouse', { 
          status: 'done', 
          message: `Using existing: ${existingWarehouse.name}`,
          id: existingWarehouse.id 
        });
        return existingWarehouse.id;
      }
      
      const location = await createLocation({
        name: 'Test Main Warehouse',
        location_type: 'warehouse',
        city: 'Riyadh',
        country: 'SA',
      });

      if (location) {
        await refetchLocations();
        updateStep('warehouse', { 
          status: 'done', 
          message: `Created: ${location.name}`,
          id: location.id 
        });
        return location.id;
      }
      throw new Error('Failed to create warehouse');
    } catch (error) {
      updateStep('warehouse', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step B2: Create delivery location
  const runStepDelivery = async () => {
    updateStep('delivery', { status: 'running' });
    try {
      // Look for existing test delivery location or distribution center
      const existingDelivery = locations.find(l => 
        l.name.startsWith('Test Delivery') || l.location_type === 'distribution_center'
      );
      if (existingDelivery) {
        updateStep('delivery', { 
          status: 'done', 
          message: `Using existing: ${existingDelivery.name}`,
          id: existingDelivery.id 
        });
        return existingDelivery.id;
      }

      const location = await createLocation({
        name: 'Test Delivery Site',
        location_type: 'distribution_center',
        city: 'Jeddah',
        country: 'SA',
      });

      if (location) {
        await refetchLocations();
        updateStep('delivery', { 
          status: 'done', 
          message: `Created: ${location.name}`,
          id: location.id 
        });
        return location.id;
      }
      throw new Error('Failed to create delivery location');
    } catch (error) {
      updateStep('delivery', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step C: Create sample item
  const runStepItem = async () => {
    updateStep('item', { status: 'running' });
    try {
      // Look for test item first
      const testItem = items.find(i => i.sku === 'TEST-SKU-001');
      if (testItem) {
        updateStep('item', { 
          status: 'done', 
          message: `Using existing: ${testItem.name}`,
          id: testItem.id 
        });
        return testItem;
      }
      
      if (items.length > 0) {
        updateStep('item', { 
          status: 'done', 
          message: `Using existing: ${items[0].name}`,
          id: items[0].id 
        });
        return items[0];
      }
      
      const item = await createItem({
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        unit: 'pcs',
        description: 'Sample item for workflow testing',
      });
      
      if (item) {
        await refetchItems();
        updateStep('item', { 
          status: 'done', 
          message: `Created: ${item.name} (${item.sku})`,
          id: item.id 
        });
        return item;
      }
      throw new Error('Failed to create item');
    } catch (error) {
      updateStep('item', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step D: Create order
  const runStepOrder = async (customerId: string, pickupId: string, deliveryId: string, item: { id: string; name: string; unit: string }) => {
    updateStep('order', { status: 'running' });
    try {
      const order = await createOrder(
        {
          customer_id: customerId,
          pickup_location_id: pickupId,
          delivery_location_id: deliveryId,
          notes: 'Workflow test order',
        },
        [{
          item_id: item.id,
          item_name: item.name,
          quantity: 10,
          unit: item.unit,
          unit_price: 100,
          notes: null,
        }]
      );
      
      if (order) {
        await refetchOrders();
        updateStep('order', { 
          status: 'done', 
          message: `Created: ${order.order_number}`,
          id: order.id 
        });
        return order;
      }
      throw new Error('Failed to create order');
    } catch (error) {
      updateStep('order', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step E: Confirm order
  const runStepConfirm = async (orderId: string) => {
    updateStep('confirm', { status: 'running' });
    try {
      const success = await updateOrderStatus(orderId, 'Confirmed');
      if (success) {
        await refetchOrders();
        updateStep('confirm', { 
          status: 'done', 
          message: 'Order confirmed successfully',
          id: orderId 
        });
        return true;
      }
      throw new Error('Failed to confirm order');
    } catch (error) {
      updateStep('confirm', { status: 'error', message: String(error) });
      return false;
    }
  };

  // Step F: Convert to shipment
  const runStepShipment = async (orderId: string) => {
    updateStep('shipment', { status: 'running' });
    try {
      const result = await convertToShipment(orderId);
      if (result.id) {
        await refetchOrders();
        updateStep('shipment', { 
          status: 'done', 
          message: `Shipment created: ${result.id.substring(0, 8)}...`,
          id: result.id 
        });
        return result.id;
      }
      updateStep('shipment', { 
        status: 'error', 
        message: result.error || 'Failed to convert to shipment' 
      });
      return null;
    } catch (error) {
      updateStep('shipment', { status: 'error', message: String(error) });
      return null;
    }
  };

  // Step G: Add inbound inventory
  const runStepInventory = async (itemId: string, locationId: string) => {
    updateStep('inventory', { status: 'running' });
    try {
      const success = await adjustInventory(
        itemId,
        locationId,
        50,
        'Inbound',
        'Workflow test inbound'
      );
      if (success) {
        await refetchInventory();
        updateStep('inventory', { 
          status: 'done', 
          message: 'Added 50 units inbound to warehouse' 
        });
        return true;
      }
      throw new Error('Failed to adjust inventory');
    } catch (error) {
      updateStep('inventory', { status: 'error', message: String(error) });
      return false;
    }
  };

  // Step H: Create and process invoice
  const runStepInvoice = async (customerId: string) => {
    updateStep('invoice', { status: 'running' });
    try {
      const invoice = await createInvoice(
        {
          customer_id: customerId,
          currency: 'SAR',
          tax_amount: 150, // 15% VAT
          notes: 'Workflow test invoice',
        },
        [{
          description: 'Test Product x10',
          quantity: 10,
          unit_price: 100,
          total_price: 1000,
        }]
      );
      
      if (!invoice) throw new Error('Failed to create invoice');
      
      // Update to Sent
      await updateInvoiceStatus(invoice.id, 'Sent');
      // Update to Paid
      await updateInvoiceStatus(invoice.id, 'Paid');
      
      await refetchInvoices();
      updateStep('invoice', { 
        status: 'done', 
        message: `Invoice ${invoice.invoice_number} created and marked Paid`,
        id: invoice.id 
      });
      return true;
    } catch (error) {
      updateStep('invoice', { status: 'error', message: String(error) });
      return false;
    }
  };

  // Run all steps
  const runFullWorkflow = async () => {
    toast.info('Starting workflow check...');
    
    // Reset all steps
    setSteps({
      customer: { status: 'pending' },
      warehouse: { status: 'pending' },
      delivery: { status: 'pending' },
      item: { status: 'pending' },
      order: { status: 'pending' },
      confirm: { status: 'pending' },
      shipment: { status: 'pending' },
      inventory: { status: 'pending' },
      invoice: { status: 'pending' },
    });

    // Step A: Customer
    const customerId = await runStepCustomer();
    if (!customerId) return;

    // Step B: Locations
    const warehouseId = await runStepWarehouse();
    if (!warehouseId) return;

    const deliveryId = await runStepDelivery();
    if (!deliveryId) return;

    // Step C: Item
    const item = await runStepItem();
    if (!item) return;

    // Step D: Order
    const order = await runStepOrder(customerId, warehouseId, deliveryId, item);
    if (!order) return;

    // Step E: Confirm
    const confirmed = await runStepConfirm(order.id);
    if (!confirmed) return;

    // Step F: Shipment
    const shipmentId = await runStepShipment(order.id);
    if (!shipmentId) return;

    // Step G: Inventory
    const inventoryAdded = await runStepInventory(item.id, warehouseId);
    if (!inventoryAdded) return;

    // Step H: Invoice
    await runStepInvoice(customerId);

    toast.success('Workflow completed successfully!');
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <Circle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: StepStatus) => {
    switch (status) {
      case 'done':
        return <Badge variant="default" className="bg-green-500">Done</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const stepConfigs = [
    { key: 'customer', label: 'A', title: 'Create Customer', description: 'Create or use existing test customer' },
    { key: 'warehouse', label: 'B1', title: 'Create Warehouse', description: 'Create warehouse location' },
    { key: 'delivery', label: 'B2', title: 'Create Delivery Site', description: 'Create customer delivery location' },
    { key: 'item', label: 'C', title: 'Create Item/SKU', description: 'Create test product' },
    { key: 'order', label: 'D', title: 'Create Order', description: 'Create draft order with 1 line item' },
    { key: 'confirm', label: 'E', title: 'Confirm Order', description: 'Update status to Confirmed' },
    { key: 'shipment', label: 'F', title: 'Convert to Shipment', description: 'Create shipment from order' },
    { key: 'inventory', label: 'G', title: 'Add Inbound Stock', description: 'Add inventory via Inbound movement' },
    { key: 'invoice', label: 'H', title: 'Create & Pay Invoice', description: 'Create invoice, mark Sent then Paid' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ERP Workflow Check</h1>
          <p className="text-muted-foreground">
            Test the complete ERP workflow: Customer → Order → Shipment → Inventory → Invoice
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Run Full Workflow
            </CardTitle>
            <CardDescription>
              Click to execute all steps sequentially. Each step will use existing data if available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runFullWorkflow} size="lg" className="w-full sm:w-auto">
              <Play className="w-4 h-4 mr-2" />
              Start Workflow Check
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {stepConfigs.map((config, index) => (
            <Card key={config.key} className={steps[config.key].status === 'error' ? 'border-red-500' : ''}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold">
                  {config.label}
                </div>
                {getStepIcon(steps[config.key].status)}
                <div className="flex-1">
                  <div className="font-medium">{config.title}</div>
                  <div className="text-sm text-muted-foreground">{config.description}</div>
                  {steps[config.key].message && (
                    <div className={`text-sm mt-1 ${steps[config.key].status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                      {steps[config.key].message}
                    </div>
                  )}
                  {steps[config.key].id && (
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                      ID: {steps[config.key].id}
                    </code>
                  )}
                </div>
                {getStatusBadge(steps[config.key].status)}
                {index < stepConfigs.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Manual Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate to <strong>Tools → Customers</strong> to verify customer was created</li>
              <li>Navigate to <strong>Tools → Locations</strong> to verify warehouse and delivery site</li>
              <li>Navigate to <strong>Tools → Items/SKUs</strong> to verify test item</li>
              <li>Navigate to <strong>Tools → Orders</strong> to see the order (should be "ConvertedToShipment")</li>
              <li>Navigate to <strong>Tools → My Shipments</strong> to see the created shipment</li>
              <li>Navigate to <strong>Tools → Inventory</strong> to verify stock and ledger entry</li>
              <li>Navigate to <strong>Tools → Invoices</strong> to see the paid invoice</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WorkflowCheck;
