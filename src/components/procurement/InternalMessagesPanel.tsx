import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternalMessages } from '@/hooks/useInternalMessages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Props {
  entityType: string;
  entityId: string;
  entityLabel?: string;
}

const InternalMessagesPanel = ({ entityType, entityId, entityLabel }: Props) => {
  const { language } = useLanguage();
  const { messages, loading, fetchMessages, sendMessage } = useInternalMessages(entityType, entityId);
  const [newMessage, setNewMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && entityId) {
      fetchMessages();
    }
  }, [open, entityId, fetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'الرسائل' : 'Messages'}
          {messages.length > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
              {messages.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {language === 'ar' ? 'الرسائل الداخلية' : 'Internal Messages'}
            {entityLabel && <span className="text-sm text-muted-foreground ml-2">— {entityLabel}</span>}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 my-4 pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-muted rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{msg.sender_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={2}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InternalMessagesPanel;
