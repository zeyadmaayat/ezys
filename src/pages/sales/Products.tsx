import { useState } from 'react';
import { SalesLayout } from '@/components/sales/SalesLayout';
import { useProducts, SalesProduct } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Wifi, Signal, Radio, Check, X, Search,
  Smartphone, Router, Zap, Globe,
} from 'lucide-react';

const categoryIcons: Record<string, typeof Wifi> = {
  Fiber: Globe,
  '4G': Signal,
  '5G': Zap,
  Mobile: Smartphone,
};

const categoryColors: Record<string, string> = {
  Fiber: 'from-blue-500 to-cyan-500',
  '4G': 'from-amber-500 to-orange-500',
  '5G': 'from-violet-500 to-purple-500',
  Mobile: 'from-green-500 to-emerald-500',
};

function FeatureBadge({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {included ? (
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground/40" />
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground/50'}>{label}</span>
    </div>
  );
}

function ProductCard({ product }: { product: SalesProduct }) {
  const totalPrice = product.price_jd + (product.sim_price_jd || 0);
  const CatIcon = categoryIcons[product.category] || Wifi;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${categoryColors[product.category] || 'from-primary to-primary'}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
            {product.subcategory && (
              <p className="text-xs text-muted-foreground">{product.subcategory}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColors[product.category]} text-white`}>
            <CatIcon className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Speed & Capacity */}
        <div className="flex gap-3">
          {product.speed && (
            <div className="flex-1 rounded-lg bg-muted/50 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Speed</p>
              <p className="text-sm font-bold text-foreground">{product.speed}</p>
            </div>
          )}
          {product.capacity && (
            <div className="flex-1 rounded-lg bg-muted/50 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Capacity</p>
              <p className="text-sm font-bold text-foreground">{product.capacity}</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-1.5">
          <FeatureBadge label="SIM Card" included={product.includes_sim} />
          <FeatureBadge label="MiFi" included={product.includes_mifi} />
          <FeatureBadge label="Router" included={product.includes_router} />
          <FeatureBadge label="Extender" included={product.includes_extender} />
          <FeatureBadge label="VoIP" included={product.includes_voip} />
          <FeatureBadge label="WiFi Modem" included={product.includes_wifi_modem} />
        </div>

        {/* Device Info */}
        {product.device_info && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-2.5 py-1.5">
            <Router className="w-3.5 h-3.5" />
            {product.device_info}
          </div>
        )}

        {/* Price */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{product.price_jd.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">JD / month</p>
            </div>
            {product.sim_price_jd > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">+ SIM {product.sim_price_jd.toFixed(2)} JD</p>
                <p className="text-sm font-semibold text-primary">Total: {totalPrice.toFixed(2)} JD</p>
              </div>
            )}
          </div>
        </div>

        {/* Segment badges */}
        <div className="flex gap-1.5">
          {product.segment && (
            <Badge variant="outline" className="text-[10px]">{product.segment}</Badge>
          )}
          <Badge variant="secondary" className="text-[10px] capitalize">
            {product.customer_type === 'both' ? 'B2B & B2C' : product.customer_type.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
  const { language } = useLanguage();
  const { products, loading, categories } = useProducts();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.subcategory || '').toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || p.category === activeTab;
    return matchSearch && matchTab;
  });

  // Group by subcategory
  const grouped = filtered.reduce<Record<string, SalesProduct[]>>((acc, p) => {
    const key = p.subcategory || p.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <SalesLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'كتالوج المنتجات' : 'Product Catalog'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'باقات وخدمات Orange' : 'Orange packages & services'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <img src="/images/ezy-logo.svg" alt="Orange" className="h-8 w-8 rounded" />
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={language === 'ar' ? 'بحث...' : 'Search products...'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(c => {
                const Icon = categoryIcons[c] || Wifi;
                return (
                  <TabsTrigger key={c} value={c} className="gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {c}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            const Icon = categoryIcons[cat] || Wifi;
            return (
              <Card key={cat} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(cat)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${categoryColors[cat]} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{cat} Plans</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">Total Plans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products grouped */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found</div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-primary" />
                {group}
                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </SalesLayout>
  );
}
