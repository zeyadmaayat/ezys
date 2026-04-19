import MainLayout from '@/components/MainLayout';
import { AiAssistantChat } from '@/components/ai/AiAssistantChat';

export default function AiAssistant() {
  return (
    <MainLayout>
      <AiAssistantChat variant="page" />
    </MainLayout>
  );
}
