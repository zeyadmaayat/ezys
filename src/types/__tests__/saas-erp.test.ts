import { describe, it, expect } from 'vitest';
import {
  SHIPMENT_STATUS_ORDER,
  SHIPMENT_STATUS_LABELS,
  type ShipmentStatusV2,
} from '@/types/saas-erp';

describe('shipment status lifecycle', () => {
  it('follows the Created -> Delivered order', () => {
    expect(SHIPMENT_STATUS_ORDER).toEqual([
      'CREATED',
      'PICKED_UP',
      'IN_WAREHOUSE',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ]);
  });

  it('has a label for every status', () => {
    for (const status of SHIPMENT_STATUS_ORDER) {
      expect(SHIPMENT_STATUS_LABELS[status]).toBeTruthy();
    }
    expect(Object.keys(SHIPMENT_STATUS_LABELS)).toHaveLength(
      SHIPMENT_STATUS_ORDER.length,
    );
  });

  it('treats DELIVERED as terminal', () => {
    expect(SHIPMENT_STATUS_ORDER.at(-1)).toBe('DELIVERED');
  });

  it('allows only single forward steps (mirrors hook validation)', () => {
    const canTransition = (from: ShipmentStatusV2, to: ShipmentStatusV2) => {
      const a = SHIPMENT_STATUS_ORDER.indexOf(from);
      const b = SHIPMENT_STATUS_ORDER.indexOf(to);
      return b === a + 1;
    };

    expect(canTransition('CREATED', 'PICKED_UP')).toBe(true);
    expect(canTransition('CREATED', 'DELIVERED')).toBe(false);
    expect(canTransition('DELIVERED', 'CREATED')).toBe(false);
    expect(canTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
  });
});
