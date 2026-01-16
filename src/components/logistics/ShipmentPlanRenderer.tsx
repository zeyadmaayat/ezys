import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Package, Ship, Plane, Truck, FileText, AlertTriangle, CheckCircle2, DollarSign, ClipboardList } from 'lucide-react';

interface ShipmentPlan {
  shipment_summary: {
    origin: string;
    destination: string;
    shipment_type: string;
    product_category: string;
    weight_kg: string;
    volume_cbm: string;
    priority: string;
  };
  recommended_shipping_options: Array<{
    mode: string;
    why: string;
    estimated_transit_time: string;
    cost_level: string;
    pros: string[];
    cons: string[];
  }>;
  best_option: {
    mode: string;
    route: string;
    reason: string;
  };
  required_documents: Array<{
    document_name: string;
    who_issues_it: string;
    notes: string;
  }>;
  customs_and_compliance: {
    possible_restrictions: string[];
    approvals_or_certificates: string[];
    notes: string;
  };
  cost_estimation: {
    shipping_cost_range: string;
    customs_and_taxes_note: string;
    other_fees: string[];
  };
  step_by_step_checklist: string[];
  warnings_and_notes: string[];
  missing_information_if_any: string[];
}

const getModeIcon = (mode: string) => {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('air')) return <Plane className="h-5 w-5" />;
  if (lowerMode.includes('sea')) return <Ship className="h-5 w-5" />;
  return <Truck className="h-5 w-5" />;
};

const getCostBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' => {
  const lower = level.toLowerCase();
  if (lower === 'low') return 'secondary';
  if (lower === 'high') return 'destructive';
  return 'default';
};

interface ShipmentPlanRendererProps {
  content: string;
}

export function ShipmentPlanRenderer({ content }: ShipmentPlanRendererProps) {
  const plan = useMemo<ShipmentPlan | null>(() => {
    try {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }, [content]);

  if (!plan) return null;

  return (
    <div className="space-y-4">
      {/* Shipment Summary */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Shipment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Origin:</span>
              <p className="font-medium">{plan.shipment_summary.origin}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Destination:</span>
              <p className="font-medium">{plan.shipment_summary.destination}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium">{plan.shipment_summary.shipment_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Product:</span>
              <p className="font-medium">{plan.shipment_summary.product_category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <p className="font-medium">{plan.shipment_summary.weight_kg} kg</p>
            </div>
            <div>
              <span className="text-muted-foreground">Volume:</span>
              <p className="font-medium">{plan.shipment_summary.volume_cbm} CBM</p>
            </div>
          </div>
          <Badge className="mt-3">{plan.shipment_summary.priority}</Badge>
        </CardContent>
      </Card>

      {/* Best Option */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Recommended Option
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-2">
            {getModeIcon(plan.best_option.mode)}
            <span className="font-semibold text-lg">{plan.best_option.mode}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Route:</strong> {plan.best_option.route}
          </p>
          <p className="text-sm">{plan.best_option.reason}</p>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={['options', 'documents', 'checklist']} className="space-y-2">
        {/* Shipping Options */}
        <AccordionItem value="options" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              All Shipping Options ({plan.recommended_shipping_options.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {plan.recommended_shipping_options.map((opt, idx) => (
                <Card key={idx} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getModeIcon(opt.mode)}
                        <span className="font-medium">{opt.mode}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{opt.estimated_transit_time}</Badge>
                        <Badge variant={getCostBadgeVariant(opt.cost_level)}>
                          {opt.cost_level} Cost
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{opt.why}</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">Pros:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {opt.pros.map((pro, i) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-600 dark:text-red-400 mb-1">Cons:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {opt.cons.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Documents */}
        <AccordionItem value="documents" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Required Documents ({plan.required_documents.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {plan.required_documents.map((doc, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{doc.document_name}</p>
                  <p className="text-sm text-muted-foreground">Issued by: {doc.who_issues_it}</p>
                  {doc.notes && <p className="text-sm mt-1">{doc.notes}</p>}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cost Estimation */}
        <AccordionItem value="cost" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Estimation
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">Shipping Cost Range:</p>
                <p className="font-semibold text-lg">{plan.cost_estimation.shipping_cost_range}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customs & Taxes:</p>
                <p>{plan.cost_estimation.customs_and_taxes_note}</p>
              </div>
              {plan.cost_estimation.other_fees.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Other Fees:</p>
                  <ul className="list-disc list-inside text-sm">
                    {plan.cost_estimation.other_fees.map((fee, i) => (
                      <li key={i}>{fee}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step-by-Step Checklist */}
        <AccordionItem value="checklist" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Step-by-Step Checklist
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-2 pt-2">
              {plan.step_by_step_checklist.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Customs & Compliance */}
        <AccordionItem value="customs" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Customs & Compliance
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {plan.customs_and_compliance.possible_restrictions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                    Possible Restrictions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {plan.customs_and_compliance.possible_restrictions.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.customs_and_compliance.approvals_or_certificates.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Required Approvals/Certificates:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {plan.customs_and_compliance.approvals_or_certificates.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.customs_and_compliance.notes && (
                <p className="text-sm">{plan.customs_and_compliance.notes}</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Warnings */}
      {plan.warnings_and_notes.length > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Warnings & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {plan.warnings_and_notes.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
