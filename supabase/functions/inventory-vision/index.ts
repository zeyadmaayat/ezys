// AI Vision Scanner - identifies products, invoices, documents from photos
// Uses Lovable AI (Gemini 2.5 Flash with vision) - no API key required
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisionRequest {
  image_base64: string;
  scan_type: 'product' | 'invoice' | 'document' | 'shipment_label';
  language?: 'ar' | 'en';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { image_base64, scan_type, language = 'en' }: VisionRequest = await req.json();
    if (!image_base64 || !scan_type) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get company_id and current items catalog for matching
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
    const companyId = profile?.company_id;

    const { data: items } = await supabase
      .from('items').select('id, sku, name, barcode, unit, description').eq('is_active', true).limit(200);

    const { data: locations } = await supabase
      .from('locations').select('id, name, location_type').eq('is_active', true).limit(50);

    // Build prompt depending on scan type
    const itemList = (items || []).map(i => `- ${i.sku} | ${i.name}${i.barcode ? ` (barcode: ${i.barcode})` : ''}`).join('\n');
    const locationList = (locations || []).map(l => `- ${l.id} | ${l.name} (${l.location_type})`).join('\n');

    const systemPrompts = {
      product: `You are a warehouse inventory AI vision expert. Analyze the photo and identify the product. Match against this catalog:\n${itemList}\n\nAvailable storage locations:\n${locationList}\n\nReturn STRICT JSON with: { "detected": true|false, "matched_item_sku": "...", "matched_item_name": "...", "matched_item_id": "...", "detected_quantity": number, "confidence": 0-100, "suggested_location_id": "...", "suggested_location_name": "...", "suggested_action": "add"|"avoid"|"place_on_shelf"|"unknown", "reasoning": "short explanation in ${language === 'ar' ? 'Arabic' : 'English'}", "current_stock_advice": "string in ${language === 'ar' ? 'Arabic' : 'English'}" }`,
      invoice: `You are an accounting AI. Extract invoice details from the photo. Return JSON: { "vendor_name": "", "invoice_number": "", "invoice_date": "YYYY-MM-DD", "currency": "", "subtotal": 0, "tax": 0, "total": 0, "line_items": [{"description":"","quantity":0,"unit_price":0,"total":0}], "notes": "in ${language === 'ar' ? 'Arabic' : 'English'}" }`,
      document: `Analyze this document photo. Return JSON: { "document_type": "", "key_fields": {}, "summary": "in ${language === 'ar' ? 'Arabic' : 'English'}" }`,
      shipment_label: `Extract shipment label info. Return JSON: { "tracking_number": "", "sender": "", "receiver": "", "weight": "", "destination": "" }`,
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[scan_type] },
          { role: 'user', content: [
            { type: 'text', text: language === 'ar' ? 'حلل هذه الصورة وأعطني الإجابة بصيغة JSON فقط بدون أي نص إضافي.' : 'Analyze this image and return ONLY valid JSON, no extra text.' },
            { type: 'image_url', image_url: { url: image_base64.startsWith('data:') ? image_base64 : `data:image/jpeg;base64,${image_base64}` } }
          ]}
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI error:', aiResponse.status, errText);
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI processing failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '{}';
    // Extract JSON from possible markdown wrapping
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent); } catch { parsed = { raw: rawContent }; }

    // Enrich with current stock if product matched
    if (scan_type === 'product' && parsed.matched_item_id) {
      const { data: stock } = await supabase
        .from('inventory').select('quantity, reserved_quantity, location:locations(name)')
        .eq('item_id', parsed.matched_item_id);
      parsed.current_stock = stock || [];
      const totalQty = (stock || []).reduce((s, i) => s + Number(i.quantity || 0), 0);
      parsed.total_quantity_on_hand = totalQty;
    }

    // Save scan record
    await supabase.from('vision_scans').insert({
      company_id: companyId,
      user_id: user.id,
      scan_type,
      ai_result: parsed,
      matched_item_id: parsed.matched_item_id || null,
      matched_location_id: parsed.suggested_location_id || null,
      detected_quantity: parsed.detected_quantity || null,
    });

    return new Response(JSON.stringify({ success: true, result: parsed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Vision error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
