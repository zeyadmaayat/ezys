import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipments } from '@/hooks/useShipments';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Package, Loader2 } from 'lucide-react';

interface CreateShipmentButtonProps {
  planId: string;
  disabled?: boolean;
}

export function CreateShipmentButton({ planId, disabled }: CreateShipmentButtonProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { createShipment } = useShipments();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const shipment = await createShipment(planId);
    setLoading(false);
    
    if (shipment) {
      navigate(`/shipments/${shipment.id}`);
    }
  };

  const t = language === 'ar' ? 'إنشاء شحنة' : 'Create Shipment';

  return (
    <Button
      onClick={handleCreate}
      disabled={disabled || loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Package className="h-4 w-4" />
      )}
      {t}
    </Button>
  );
}
