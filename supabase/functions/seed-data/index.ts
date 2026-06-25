import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get company_id
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Only company admins may seed demo data.
    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await userClient.from("profiles").select("company_id").eq("id", user.id).single();
    if (!profile?.company_id) throw new Error("No company found");

    const companyId = profile.company_id;


    // Service client for inserts
    const db = createClient(supabaseUrl, serviceKey);

    const results: Record<string, number> = {};

    // ══════════════ 1. CLIENTS (20) ══════════════
    const clientNames = [
      { name: "شركة النقل السريع", type: "CLIENT", email: "fast@transport.sa", phone: "+966501001001" },
      { name: "مؤسسة الخليج للتجارة", type: "CLIENT", email: "gulf@trade.sa", phone: "+966501001002" },
      { name: "شركة الوطنية للشحن", type: "CLIENT", email: "national@shipping.sa", phone: "+966501001003" },
      { name: "مجموعة الرياض اللوجستية", type: "CLIENT", email: "riyadh@logistics.sa", phone: "+966501001004" },
      { name: "شركة جدة للتوريدات", type: "CLIENT", email: "jeddah@supply.sa", phone: "+966501001005" },
      { name: "مؤسسة الدمام التجارية", type: "CLIENT", email: "dammam@commerce.sa", phone: "+966501001006" },
      { name: "شركة المدينة للتصدير", type: "CLIENT", email: "madinah@export.sa", phone: "+966501001007" },
      { name: "مؤسسة تبوك للنقليات", type: "CLIENT", email: "tabuk@transport.sa", phone: "+966501001008" },
      { name: "شركة أبها للتجارة الدولية", type: "CLIENT", email: "abha@intl.sa", phone: "+966501001009" },
      { name: "مجموعة القصيم اللوجستية", type: "CLIENT", email: "qassim@logistics.sa", phone: "+966501001010" },
      { name: "شركة الفيصل للتوريدات", type: "VENDOR", email: "faisal@supply.sa", phone: "+966502001001" },
      { name: "مؤسسة الحرمين للمواد", type: "VENDOR", email: "haramain@materials.sa", phone: "+966502001002" },
      { name: "شركة السلام للتغليف", type: "VENDOR", email: "salam@packaging.sa", phone: "+966502001003" },
      { name: "مؤسسة الأمان للمعدات", type: "VENDOR", email: "aman@equipment.sa", phone: "+966502001004" },
      { name: "شركة البركة للحديد", type: "VENDOR", email: "baraka@steel.sa", phone: "+966502001005" },
      { name: "مؤسسة النور للكيماويات", type: "VENDOR", email: "noor@chemicals.sa", phone: "+966502001006" },
      { name: "شركة الوفاء للأخشاب", type: "VENDOR", email: "wafa@wood.sa", phone: "+966502001007" },
      { name: "مؤسسة التقدم للبلاستيك", type: "VENDOR", email: "taqadum@plastic.sa", phone: "+966502001008" },
      { name: "شركة الإتقان للإلكترونيات", type: "VENDOR", email: "itqan@electronics.sa", phone: "+966502001009" },
      { name: "مؤسسة الجودة للمستلزمات", type: "VENDOR", email: "quality@supplies.sa", phone: "+966502001010" },
    ];

    const { data: clients, error: clientsErr } = await db.from("clients").insert(
      clientNames.map(c => ({
        company_id: companyId,
        name: c.name,
        type: c.type,
        email: c.email,
        phone: c.phone,
        address: { city: "Amman", country: "JO" },
        created_by: user.id,
      }))
    ).select("id, type");
    if (clientsErr) throw new Error(`clients: ${clientsErr.message}`);
    results.clients = clients?.length ?? 0;

    const clientIds = clients?.filter((c: any) => c.type === "CLIENT").map((c: any) => c.id) ?? [];
    const vendorIds = clients?.filter((c: any) => c.type === "VENDOR").map((c: any) => c.id) ?? [];

    // ══════════════ 2. WAREHOUSES (20) ══════════════
    const whNames = [
      "مستودع الرياض المركزي", "مستودع جدة الرئيسي", "مستودع الدمام الصناعي",
      "مستودع المدينة", "مستودع تبوك", "مستودع أبها", "مستودع القصيم",
      "مستودع حائل", "مستودع نجران", "مستودع الجبيل", "مستودع ينبع",
      "مستودع الطائف", "مستودع خميس مشيط", "مستودع الخبر", "مستودع الظهران",
      "مستودع بريدة", "مستودع عرعر", "مستودع سكاكا", "مستودع جازان", "مستودع الباحة",
    ];
    const cities = [
      "الرياض", "جدة", "الدمام", "المدينة", "تبوك", "أبها", "القصيم",
      "حائل", "نجران", "الجبيل", "ينبع", "الطائف", "خميس مشيط", "الخبر",
      "الظهران", "بريدة", "عرعر", "سكاكا", "جازان", "الباحة",
    ];

    const { data: warehouses } = await db.from("warehouses").insert(
      whNames.map((name, i) => ({
        company_id: companyId,
        name,
        city: cities[i],
        country: "JO",
        location: cities[i],
        address_line1: `شارع الملك فهد ${i + 1}`,
      }))
    ).select("id");
    results.warehouses = warehouses?.length ?? 0;
    const warehouseIds = warehouses?.map(w => w.id) ?? [];

    // ══════════════ 3. ITEMS (20) ══════════════
    const itemData = [
      { sku: "STL-BEAM-001", name: "حديد تسليح 12مم", unit: "ton" },
      { sku: "STL-PIPE-002", name: "أنابيب فولاذية 4 بوصة", unit: "pcs" },
      { sku: "CHM-POLY-001", name: "بولي إيثيلين خام", unit: "kg" },
      { sku: "CHM-RESIN-002", name: "راتنج إيبوكسي", unit: "ltr" },
      { sku: "ELC-CABLE-001", name: "كابلات كهربائية 16مم", unit: "mtr" },
      { sku: "ELC-PANEL-002", name: "لوحات توزيع كهربائية", unit: "pcs" },
      { sku: "WOD-PLY-001", name: "خشب أبلكاش 18مم", unit: "sheet" },
      { sku: "WOD-MDF-002", name: "خشب MDF 15مم", unit: "sheet" },
      { sku: "PKG-CARD-001", name: "كراتين تغليف كبيرة", unit: "pcs" },
      { sku: "PKG-WRAP-002", name: "لفافات بلاستيك تغليف", unit: "roll" },
      { sku: "PLM-PIPE-001", name: "أنابيب PVC 2 بوصة", unit: "mtr" },
      { sku: "PLM-FIT-002", name: "وصلات سباكة متنوعة", unit: "pcs" },
      { sku: "PNT-INT-001", name: "دهان داخلي أبيض", unit: "bucket" },
      { sku: "PNT-EXT-002", name: "دهان خارجي مقاوم", unit: "bucket" },
      { sku: "CEM-OPC-001", name: "إسمنت بورتلاندي عادي", unit: "bag" },
      { sku: "CEM-WPC-002", name: "إسمنت أبيض", unit: "bag" },
      { sku: "INS-FOAM-001", name: "عازل فوم حراري", unit: "sqm" },
      { sku: "INS-WOOL-002", name: "صوف صخري عازل", unit: "roll" },
      { sku: "HRD-BOLT-001", name: "مسامير وبراغي متنوعة", unit: "box" },
      { sku: "HRD-TOOL-002", name: "عدة أدوات يدوية", unit: "set" },
    ];

    const { data: items } = await db.from("items").insert(
      itemData.map(item => ({
        company_id: companyId,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        description: `${item.name} - مواد عالية الجودة`,
      }))
    ).select("id, sku, name, unit");
    results.items = items?.length ?? 0;
    const itemIds = items?.map(i => i.id) ?? [];

    // ══════════════ 4. CUSTOMERS (20) ══════════════
    const custNames = [
      "أحمد محمد العلي", "فاطمة عبدالله الشمري", "خالد إبراهيم السعيد",
      "نورة سعد القحطاني", "محمد علي الغامدي", "سارة حسن العتيبي",
      "عبدالرحمن يوسف الدوسري", "هدى فهد المطيري", "سلطان عبدالعزيز الحربي",
      "ريم ناصر الزهراني", "عمر طارق البلوي", "لينا ماجد العنزي",
      "يزيد سامي الشهري", "منيرة خالد الرشيدي", "بندر وليد السبيعي",
      "غادة سلمان المالكي", "تركي فيصل العمري", "أمل راشد الجهني",
      "ماجد حمد الثبيتي", "دلال عادل السلمي",
    ];

    const { data: customers } = await db.from("customers").insert(
      custNames.map((name, i) => ({
        company_id: companyId,
        name,
        email: `customer${i + 1}@example.sa`,
        phone: `+9665030${String(i + 1).padStart(5, "0")}`,
        billing_address: { city: cities[i % cities.length], country: "JO", street: `شارع ${i + 1}` },
        created_by: user.id,
      }))
    ).select("id");
    results.customers = customers?.length ?? 0;
    const customerIds = customers?.map(c => c.id) ?? [];

    // ══════════════ 5. LOCATIONS (20) ══════════════
    const locTypes = ["warehouse", "distribution_center", "pickup_point", "customer_site"];
    const { data: locations } = await db.from("locations").insert(
      cities.map((city, i) => ({
        company_id: companyId,
        name: `موقع ${city}`,
        location_type: locTypes[i % locTypes.length],
        city,
        country: "JO",
        address_line1: `طريق الملك عبدالعزيز ${i + 10}`,
      }))
    ).select("id");
    results.locations = locations?.length ?? 0;
    const locationIds = locations?.map(l => l.id) ?? [];

    // ══════════════ 6. DP DRIVERS (20) ══════════════
    const driverNames = [
      "سعيد العمري", "ياسر الشهري", "فهد الحربي", "ماجد القحطاني", "عادل الغامدي",
      "راشد الدوسري", "نايف المطيري", "بدر العتيبي", "حمد الزهراني", "سلمان البلوي",
      "وليد العنزي", "مشاري السبيعي", "طلال الرشيدي", "زياد المالكي", "فارس الجهني",
      "هاني الثبيتي", "عمار السلمي", "أنس الشمري", "صالح السعيد", "كريم العلي",
    ];
    const vehicleTypes = ["VAN", "PICKUP", "TRUCK", "MOTORCYCLE"];

    const { data: drivers } = await db.from("dp_drivers").insert(
      driverNames.map((name, i) => ({
        company_id: companyId,
        name,
        phone: `+9665050${String(i + 1).padStart(5, "0")}`,
        vehicle_plate: `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 3) % 26))}${String.fromCharCode(65 + ((i + 7) % 26))} ${1000 + i}`,
        vehicle_type: vehicleTypes[i % vehicleTypes.length],
        created_by: user.id,
      }))
    ).select("id");
    results.dp_drivers = drivers?.length ?? 0;
    const driverIds = drivers?.map(d => d.id) ?? [];

    // ══════════════ 7. ORDERS (20) ══════════════
    const orderStatuses = ["Draft", "Confirmed", "Confirmed", "ConvertedToShipment"];
    const { data: orders } = await db.from("orders").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        customer_id: customerIds[i % customerIds.length],
        pickup_location_id: locationIds[i % locationIds.length],
        delivery_location_id: locationIds[(i + 5) % locationIds.length],
        delivery_address: { city: cities[i % cities.length], street: `شارع التوصيل ${i + 1}` },
        status: orderStatuses[i % orderStatuses.length],
        notes: `طلب رقم ${i + 1} - توصيل عاجل`,
        requested_date: new Date(2026, 2, 1 + i).toISOString().split("T")[0],
        created_by: user.id,
        order_number: "",
      }))
    ).select("id");
    results.orders = orders?.length ?? 0;
    const orderIds = orders?.map(o => o.id) ?? [];

    // Order items
    const orderItemsData = orderIds.flatMap((orderId, oi) => {
      const count = 2 + (oi % 3);
      return Array.from({ length: count }, (_, li) => ({
        order_id: orderId,
        item_id: itemIds[(oi + li) % itemIds.length],
        item_name: items![(oi + li) % items!.length].name,
        quantity: 10 + li * 5,
        unit: items![(oi + li) % items!.length].unit,
        unit_price: 50 + oi * 10,
        notes: null,
      }));
    });
    const { data: oiResult } = await db.from("order_items").insert(orderItemsData).select("id");
    results.order_items = oiResult?.length ?? 0;

    // ══════════════ 8. PURCHASE ORDERS (20) ══════════════
    const poStatuses = ["Draft", "Approved", "Sent", "Partial", "Received"];
    const { data: pos } = await db.from("purchase_orders").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        vendor_id: vendorIds[i % vendorIds.length],
        status: poStatuses[i % poStatuses.length],
        delivery_date: new Date(2026, 2, 10 + i).toISOString().split("T")[0],
        total_amount: 5000 + i * 1500,
        currency: "SAR",
        payment_terms: i % 2 === 0 ? "Net 30" : "Net 60",
        notes: `أمر شراء ${i + 1}`,
        created_by: user.id,
        po_number: "",
      }))
    ).select("id");
    results.purchase_orders = pos?.length ?? 0;
    const poIds = pos?.map(p => p.id) ?? [];

    // PO Lines
    const poLinesData = poIds.flatMap((poId, pi) => {
      const count = 2 + (pi % 3);
      return Array.from({ length: count }, (_, li) => ({
        po_id: poId,
        line_number: li + 1,
        item_id: itemIds[(pi + li) % itemIds.length],
        item_name: items![(pi + li) % items!.length].name,
        quantity: 20 + li * 10,
        unit: items![(pi + li) % items!.length].unit,
        unit_price: 100 + pi * 20,
      }));
    });
    const { data: plResult } = await db.from("po_lines").insert(poLinesData).select("id");
    results.po_lines = plResult?.length ?? 0;

    // ══════════════ 9. SHIPMENTS V2 (20) ══════════════
    const shipStatuses = ["CREATED", "PICKED_UP", "IN_WAREHOUSE", "OUT_FOR_DELIVERY", "DELIVERED"];
    const { data: shipmentsV2 } = await db.from("shipments_v2").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        client_id: clientIds[i % clientIds.length],
        warehouse_id: warehouseIds[i % warehouseIds.length],
        origin: cities[i % cities.length],
        destination: cities[(i + 7) % cities.length],
        status: shipStatuses[i % shipStatuses.length],
        expected_delivery: new Date(2026, 2, 5 + i).toISOString().split("T")[0],
        actual_delivery: shipStatuses[i % shipStatuses.length] === "DELIVERED" ? new Date(2026, 2, 5 + i).toISOString() : null,
        notes: `شحنة رقم ${i + 1}`,
        created_by: user.id,
        tracking_number: "",
      }))
    ).select("id");
    results.shipments_v2 = shipmentsV2?.length ?? 0;
    const shipV2Ids = shipmentsV2?.map(s => s.id) ?? [];

    // ══════════════ 10. INVOICES (20) ══════════════
    const invStatuses = ["Draft", "Sent", "Paid", "Overdue"];
    const { data: invoices } = await db.from("invoices").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        customer_id: customerIds[i % customerIds.length],
        status: invStatuses[i % invStatuses.length],
        subtotal: 3000 + i * 500,
        tax_amount: (3000 + i * 500) * 0.15,
        total_amount: (3000 + i * 500) * 1.15,
        currency: "SAR",
        issue_date: new Date(2026, 1, 1 + i).toISOString().split("T")[0],
        due_date: new Date(2026, 2, 1 + i).toISOString().split("T")[0],
        paid_date: invStatuses[i % invStatuses.length] === "Paid" ? new Date(2026, 1, 15 + i).toISOString().split("T")[0] : null,
        notes: `فاتورة ${i + 1}`,
        created_by: user.id,
        invoice_number: "",
      }))
    ).select("id");
    results.invoices = invoices?.length ?? 0;
    const invoiceIds = invoices?.map(inv => inv.id) ?? [];

    // Invoice Items
    const invItemsData = invoiceIds.flatMap((invId, ii) => {
      return Array.from({ length: 3 }, (_, li) => ({
        invoice_id: invId,
        description: items![(ii + li) % items!.length].name,
        quantity: 5 + li * 2,
        unit_price: 200 + ii * 30,
        total_price: (5 + li * 2) * (200 + ii * 30),
      }));
    });
    const { data: iiResult } = await db.from("invoice_items").insert(invItemsData).select("id");
    results.invoice_items = iiResult?.length ?? 0;

    // ══════════════ 11. INVOICES V2 (20) ══════════════
    const { data: invoicesV2 } = await db.from("invoices_v2").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        shipment_id: shipV2Ids[i % shipV2Ids.length],
        client_id: clientIds[i % clientIds.length],
        amount: 2000 + i * 750,
        currency: "SAR",
        status: invStatuses[i % invStatuses.length],
        issued_at: new Date(2026, 1, 1 + i).toISOString(),
        due_date: new Date(2026, 2, 1 + i).toISOString().split("T")[0],
        paid_at: invStatuses[i % invStatuses.length] === "Paid" ? new Date(2026, 1, 20 + i).toISOString() : null,
        notes: `فاتورة شحن ${i + 1}`,
        created_by: user.id,
        invoice_number: "",
      }))
    ).select("id");
    results.invoices_v2 = invoicesV2?.length ?? 0;
    const invV2Ids = invoicesV2?.map(iv => iv.id) ?? [];

    // ══════════════ 12. PAYMENTS (10 for paid invoices) ══════════════
    const paidInvV2 = invoicesV2?.filter((_, i) => invStatuses[i % invStatuses.length] === "Paid") ?? [];
    const methods = ["cash", "bank_transfer", "credit_card", "check"];
    if (paidInvV2.length > 0) {
      const { data: payments } = await db.from("payments").insert(
        paidInvV2.map((inv, i) => ({
          company_id: companyId,
          invoice_id: inv.id,
          amount: 2000 + (i * 4 + 2) * 750,
          method: methods[i % methods.length],
          reference: `PAY-${String(i + 1).padStart(6, "0")}`,
          created_by: user.id,
        }))
      ).select("id");
      results.payments = payments?.length ?? 0;
    }

    // ══════════════ 13. EXPENSES (20) ══════════════
    const expCategories = ["Freight", "Customs", "Insurance", "Warehouse", "Fuel", "Maintenance", "Salaries", "Utilities", "Office", "Marketing"];
    const { data: expenses } = await db.from("expenses").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        category: expCategories[i % expCategories.length],
        amount: 500 + i * 300,
        currency: "SAR",
        expense_date: new Date(2026, 1, 1 + i).toISOString().split("T")[0],
        vendor_name: clientNames[10 + (i % 10)].name,
        description: `مصروف ${expCategories[i % expCategories.length]} - ${i + 1}`,
        reference: `REF-EXP-${i + 1}`,
        shipment_id: i < 10 ? shipV2Ids[i % shipV2Ids.length] : null,
        po_id: i >= 10 ? poIds[(i - 10) % poIds.length] : null,
        created_by: user.id,
        expense_number: "",
      }))
    ).select("id");
    results.expenses = expenses?.length ?? 0;

    // ══════════════ 14. DP ZONES (5) ══════════════
    const zoneData = [
      { name: "منطقة الاستلام", code: "RCV-01" },
      { name: "منطقة التخزين", code: "STR-01" },
      { name: "منطقة الفرز", code: "SRT-01" },
      { name: "منطقة التحميل", code: "LDG-01" },
      { name: "منطقة المرتجعات", code: "RTN-01" },
    ];
    const { data: zones } = await db.from("dp_zones").insert(
      zoneData.map((z, i) => ({
        company_id: companyId,
        warehouse_id: warehouseIds[i % warehouseIds.length],
        name: z.name,
        code: z.code,
      }))
    ).select("id");
    results.dp_zones = zones?.length ?? 0;
    const zoneIds = zones?.map(z => z.id) ?? [];

    // ══════════════ 15. DP SHELVES (10) ══════════════
    const { data: shelves } = await db.from("dp_shelves").insert(
      Array.from({ length: 10 }, (_, i) => ({
        company_id: companyId,
        zone_id: zoneIds[i % zoneIds.length],
        name: `رف ${String.fromCharCode(65 + i)}${i + 1}`,
        code: `SH-${String.fromCharCode(65 + i)}${String(i + 1).padStart(2, "0")}`,
        capacity: 50 + i * 10,
      }))
    ).select("id");
    results.dp_shelves = shelves?.length ?? 0;
    const shelfIds = shelves?.map(s => s.id) ?? [];

    // ══════════════ 16. DP SHIPMENTS (20) ══════════════
    // Insert all as CREATED (status enforcement trigger prevents direct non-CREATED inserts)
    const { data: dpShipments } = await db.from("dp_shipments").insert(
      Array.from({ length: 20 }, (_, i) => ({
        company_id: companyId,
        sender_name: custNames[i % custNames.length],
        sender_phone: `+9665060${String(i + 1).padStart(5, "0")}`,
        sender_city: cities[i % cities.length],
        sender_address: `حي النهضة، شارع ${i + 1}`,
        receiver_name: custNames[(i + 10) % custNames.length],
        receiver_phone: `+9665070${String(i + 1).padStart(5, "0")}`,
        receiver_city: cities[(i + 5) % cities.length],
        receiver_address: `حي الملقا، شارع ${i + 20}`,
        origin_warehouse_id: warehouseIds[i % warehouseIds.length],
        destination_warehouse_id: warehouseIds[(i + 3) % warehouseIds.length],
        driver_id: driverIds[i % driverIds.length],
        is_cod: i % 3 === 0,
        cod_amount: i % 3 === 0 ? 150 + i * 50 : 0,
        weight_kg: 2 + i * 0.5,
        pieces_count: 1 + (i % 4),
        notes: `شحنة محلية ${i + 1}`,
        expected_delivery_at: new Date(2026, 2, 3 + i).toISOString(),
        created_by: user.id,
        barcode: "",
      }))
    ).select("id");
    results.dp_shipments = dpShipments?.length ?? 0;

    // ══════════════ 17. BLANKET ORDERS (5) ══════════════
    const { data: blankets } = await db.from("blanket_orders").insert(
      Array.from({ length: 5 }, (_, i) => ({
        company_id: companyId,
        vendor_id: vendorIds[i % vendorIds.length],
        start_date: new Date(2026, 0, 1).toISOString().split("T")[0],
        end_date: new Date(2026, 11, 31).toISOString().split("T")[0],
        release_frequency_months: 3,
        total_contract_value: 50000 + i * 25000,
        currency: "SAR",
        notes: `عقد توريد إطاري ${i + 1}`,
        created_by: user.id,
        blanket_number: "",
      }))
    ).select("id");
    results.blanket_orders = blankets?.length ?? 0;

    // ══════════════ 18. GOODS RECEIPTS (10) ══════════════
    const receivedPOs = poIds.slice(0, 10);
    const { data: grns } = await db.from("goods_receipts").insert(
      receivedPOs.map((poId, i) => ({
        company_id: companyId,
        po_id: poId,
        warehouse_id: warehouseIds[i % warehouseIds.length],
        received_date: new Date(2026, 2, 1 + i).toISOString().split("T")[0],
        status: i < 5 ? "Completed" : "Draft",
        notes: `إيصال استلام ${i + 1}`,
        created_by: user.id,
        grn_number: "",
      }))
    ).select("id");
    results.goods_receipts = grns?.length ?? 0;

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
