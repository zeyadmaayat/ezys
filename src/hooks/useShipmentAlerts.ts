import { useMemo } from 'react';
import { Shipment, ShipmentStatus } from './useShipments';
import { ShipmentDocument, DocumentStatus, DOCUMENT_TYPE_LABELS } from './useShipmentDocuments';

export interface ShipmentAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  category: 'status' | 'document' | 'timeline';
}

const STATUS_ORDER: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];

export function useShipmentAlerts(
  shipment: Shipment | null,
  documents: ShipmentDocument[]
): { alerts: ShipmentAlert[]; hasAttention: boolean } {
  const alerts = useMemo(() => {
    if (!shipment) return [];

    const result: ShipmentAlert[] = [];
    const now = new Date();
    const createdAt = new Date(shipment.created_at);
    const updatedAt = new Date(shipment.updated_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Status-based alerts
    if (shipment.status === 'Planned' && daysSinceCreation > 3) {
      result.push({
        id: 'planned-too-long',
        type: 'warning',
        message: `Shipment has been in "Planned" status for ${daysSinceCreation} days. Consider booking soon.`,
        category: 'status',
      });
    }

    if (shipment.status === 'In_Transit' && daysSinceUpdate > 7) {
      result.push({
        id: 'transit-too-long',
        type: 'warning',
        message: `Shipment has been "In Transit" for over ${daysSinceUpdate} days. Verify with carrier.`,
        category: 'timeline',
      });
    }

    if (shipment.status === 'Booked' && daysSinceUpdate > 5) {
      result.push({
        id: 'booked-no-movement',
        type: 'info',
        message: `Shipment was booked ${daysSinceUpdate} days ago but not yet in transit.`,
        category: 'status',
      });
    }

    // Document-based alerts
    const missingDocs = documents.filter(d => d.status === 'Missing');
    const requiredMissing = missingDocs.filter(d => 
      ['Commercial_Invoice', 'Packing_List', 'Bill_of_Lading'].includes(d.document_type)
    );

    if (requiredMissing.length > 0 && STATUS_ORDER.indexOf(shipment.status) >= STATUS_ORDER.indexOf('Booked')) {
      requiredMissing.forEach(doc => {
        result.push({
          id: `missing-${doc.id}`,
          type: 'error',
          message: `Missing required document: ${DOCUMENT_TYPE_LABELS[doc.document_type]}`,
          category: 'document',
        });
      });
    }

    // Pre-transit document reminder
    if (shipment.status === 'Planned' && missingDocs.length > 0) {
      result.push({
        id: 'prepare-docs',
        type: 'info',
        message: `${missingDocs.length} document(s) still need to be uploaded before booking.`,
        category: 'document',
      });
    }

    // Customs clearance reminder
    if (shipment.status === 'In_Transit') {
      const hasInvoice = documents.some(d => d.document_type === 'Commercial_Invoice' && d.status !== 'Missing');
      const hasPackingList = documents.some(d => d.document_type === 'Packing_List' && d.status !== 'Missing');
      
      if (!hasInvoice || !hasPackingList) {
        result.push({
          id: 'customs-docs-needed',
          type: 'warning',
          message: 'Ensure all customs documents are ready before arrival.',
          category: 'document',
        });
      }
    }

    return result;
  }, [shipment, documents]);

  const hasAttention = alerts.some(a => a.type === 'error' || a.type === 'warning');

  return { alerts, hasAttention };
}
