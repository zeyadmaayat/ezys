import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Shield, FileText, FolderOpen, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopicList from '@/components/admin/TopicList';
import TopicEditor from '@/components/admin/TopicEditor';

type AdminView = 'list' | 'editor';

const Admin = () => {
  const { t } = useLanguage();
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('topics');
  const [view, setView] = useState<AdminView>('list');
  const [editingTopicId, setEditingTopicId] = useState<string | undefined>();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 mx-auto text-destructive/50 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('accessDenied')}</h1>
          <p className="text-muted-foreground">{t('adminOnly')}</p>
        </div>
      </MainLayout>
    );
  }

  const handleEditTopic = (topicId: string) => {
    setEditingTopicId(topicId);
    setView('editor');
  };

  const handleAddTopic = () => {
    setEditingTopicId(undefined);
    setView('editor');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingTopicId(undefined);
  };

  const handleTopicSaved = () => {
    setView('list');
    setEditingTopicId(undefined);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('adminPanel')}</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="topics" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('manageTopics')}
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              {t('manageCategories')}
            </TabsTrigger>
            <TabsTrigger value="abbreviations" className="gap-2">
              <BookOpen className="w-4 h-4" />
              {t('manageAbbreviations')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="mt-0">
            {view === 'list' ? (
              <TopicList 
                onEdit={handleEditTopic}
                onAdd={handleAddTopic}
              />
            ) : (
              <TopicEditor
                topicId={editingTopicId}
                onBack={handleBackToList}
                onSaved={handleTopicSaved}
              />
            )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-2">{t('manageCategories')}</h2>
              <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
            </div>
          </TabsContent>

          <TabsContent value="abbreviations">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-2">{t('manageAbbreviations')}</h2>
              <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
