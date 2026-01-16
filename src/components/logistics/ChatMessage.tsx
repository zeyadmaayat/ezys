import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { ShipmentPlanRenderer } from './ShipmentPlanRenderer';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  
  // Check if content contains a shipment plan JSON
  const hasShipmentPlan = content.includes('"shipment_summary"') && content.includes('"recommended_shipping_options"');

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {hasShipmentPlan ? (
          <div className="space-y-4">
            {/* Extract and show any text before the JSON */}
            {content.split(/\{[\s\S]*\}/)[0]?.trim() && (
              <p className="whitespace-pre-wrap">{content.split(/\{[\s\S]*\}/)[0]?.trim()}</p>
            )}
            <ShipmentPlanRenderer content={content} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
