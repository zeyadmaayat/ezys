import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
}

interface Topic {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  category_id: string;
  sort_order: number | null;
  categories?: Category;
}

interface TopicListProps {
  onEdit: (topicId: string) => void;
  onAdd: () => void;
}

const TopicList = ({ onEdit, onAdd }: TopicListProps) => {
  const { t, language } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [topicsResult, categoriesResult] = await Promise.all([
      supabase
        .from('topics')
        .select('*, categories(id, name_en, name_ar, slug)')
        .order('sort_order'),
      supabase
        .from('categories')
        .select('id, name_en, name_ar, slug')
        .order('sort_order')
    ]);

    if (topicsResult.data) setTopics(topicsResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', deleteId);

    setDeleting(false);
    setDeleteId(null);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('deletedSuccess'));
      fetchData();
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = 
      topic.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.title_ar.includes(searchQuery) ||
      topic.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || topic.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (topic: Topic) => {
    if (!topic.categories) return '-';
    return language === 'ar' ? topic.categories.name_ar : topic.categories.name_en;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('manageTopics')}</h2>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('addTopic')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {language === 'ar' ? cat.name_ar : cat.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('noTopics')}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('titleEn')}</TableHead>
                <TableHead>{t('titleAr')}</TableHead>
                <TableHead>{t('categories')}</TableHead>
                <TableHead>{t('slug')}</TableHead>
                <TableHead className="w-24 text-center">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.title_en}</TableCell>
                  <TableCell dir="rtl">{topic.title_ar}</TableCell>
                  <TableCell>{getCategoryName(topic)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{topic.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(topic.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(topic.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteTopicWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TopicList;
