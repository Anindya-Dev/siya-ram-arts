import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { InventoryItem, PaginatedResponse, Product } from '../types';
import { fetchApi } from '../lib/api';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminMetrics } from '../components/admin/AdminMetrics';
import { AdminInventoryTable } from '../components/admin/AdminInventoryTable';
import { QuickStockAdjuster } from '../components/admin/QuickStockAdjuster';
import { AddProductModal, NewProductPayload } from '../components/admin/AddProductModal';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface Location { id: string; code: string; name: string; }
interface StockLocation { locationId: string; availableCount: number; }
interface LedgerEntry { id: string; variantId: string; delta: number; reason: string; note?: string; createdAt: string; }

const statusFor = (stock: number): InventoryItem['status'] => stock === 0 ? 'Out of Stock' : stock <= 2 ? 'Low Stock' : 'In Stock';
const asInventory = (product: Product): InventoryItem => {
  const variants = product.variants.map((variant) => ({
    variantId: variant.id, size: variant.size, stock: variant.totalAvailableStock, threshold: 2, unit: 'pcs' as const,
    status: variant.totalAvailableStock === 0 ? 'Out of Stock' as const : variant.totalAvailableStock <= 2 ? 'Low Stock' as const : 'Healthy' as const,
  }));
  const stock = variants.reduce((total, variant) => total + variant.stock, 0);
  return { id: product.id, productId: product.id, name: product.name, sku: product.sku, atelier: product.atelier, deityForm: product.deityForm || product.deity, materialPurity: product.materialPurity || product.material, sizeAndWeight: (product.specifications as any)?.heightWidth || variants.map((item) => item.size).join(', '), basePrice: product.basePrice, status: statusFor(stock), variants };
};

export const AdminDashboardPage: React.FC = () => {
  const { getToken } = useAuth();
  const [activeSection, setActiveSection] = useState('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adjusterItem, setAdjusterItem] = useState<InventoryItem | null>(null);
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const requestToken = () => getToken();
  const loadDashboard = async () => {
    setLoading(true); setError(null);
    try {
      const token = await requestToken();
      if (!token) throw new Error('Your admin session has expired. Please sign in again.');
      setAuthToken(token);
      const admin = await fetchApi<{ isAdmin?: boolean; is_admin?: boolean }>('/auth/verify-admin', { token });
      const isAuthorized = Boolean(admin.isAdmin ?? admin.is_admin);
      if (!isAuthorized) { setAuthorized(false); return; }
      setAuthorized(true);
      const [catalog, audit, ateliers] = await Promise.all([
        fetchApi<PaginatedResponse<Product>>('/products?limit=100', { token }),
        fetchApi<PaginatedResponse<LedgerEntry>>('/inventory/ledger?limit=20', { token }),
        fetchApi<Location[]>('/locations', { token }),
      ]);
      setProducts(catalog.items); setLedger(audit.items); setLocations(ateliers);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load live admin inventory.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadDashboard(); }, []);
  const inventory = useMemo(() => products.map(asInventory), [products]);
  const filteredItems = inventory.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (!query || [item.name, item.sku, item.deityForm, item.atelier].some((value) => value.toLowerCase().includes(query))) &&
      (selectedDeity === 'All' || item.deityForm.toLowerCase().includes(selectedDeity.toLowerCase())) &&
      (selectedMaterial === 'All' || item.materialPurity.toLowerCase().includes(selectedMaterial.toLowerCase())) &&
      (selectedStatus === 'All' || item.status === selectedStatus);
  });
  const lowStockCount = inventory.filter((item) => item.status === 'Low Stock').length;
  const showToast = (message: string) => { setToastMessage(message); window.setTimeout(() => setToastMessage(null), 4000); };

  const handleSaveStock = async (_itemId: string, variantSize: string, newCount: number, reason: string) => {
    const item = adjusterItem?.variants.find((variant) => variant.size === variantSize);
    if (!item?.variantId) throw new Error('The selected variant cannot be adjusted.');
    const token = await requestToken();
    if (!token) throw new Error('Your admin session has expired.');
    const stockByLocation = await fetchApi<StockLocation[]>(`/inventory/variants/${item.variantId}`, { token });
    const delta = newCount - item.stock;
    if (delta === 0) return;

    const parsedReason = reason.toLowerCase().includes('damaged') ? 'damage' : reason.toLowerCase().includes('fresh') ? 'restock' : 'manual_adjustment';

    if (delta > 0) {
      const locationId = stockByLocation[0]?.locationId || locations[0]?.id;
      if (!locationId) throw new Error('No active atelier location is available for this adjustment.');
      await fetchApi('/inventory/adjust', {
        method: 'POST', token,
        body: JSON.stringify({ variantId: item.variantId, locationId, delta, reason: parsedReason, note: reason })
      });
    } else {
      let toDeduct = Math.abs(delta);
      for (const loc of stockByLocation) {
        if (toDeduct <= 0) break;
        const available = loc.availableCount ?? 0;
        if (available <= 0) continue;
        const deductAmount = Math.min(available, toDeduct);
        await fetchApi('/inventory/adjust', {
          method: 'POST', token,
          body: JSON.stringify({ variantId: item.variantId, locationId: loc.locationId, delta: -deductAmount, reason: parsedReason, note: reason })
        });
        toDeduct -= deductAmount;
      }
      if (toDeduct > 0) {
        const locationId = stockByLocation[0]?.locationId || locations[0]?.id;
        if (locationId) {
          await fetchApi('/inventory/adjust', {
            method: 'POST', token,
            body: JSON.stringify({ variantId: item.variantId, locationId, delta: -toDeduct, reason: parsedReason, note: reason })
          });
        }
      }
    }
    showToast(`Saved live stock adjustment for ${variantSize}.`);
    await loadDashboard();
  };

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (item: InventoryItem) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      setProductToEdit(prod);
      setIsAddModalOpen(true);
    }
  };

  const handleSaveProduct = async (payload: NewProductPayload, isEdit: boolean, productId?: string) => {
    const token = await requestToken();
    if (!token) throw new Error('Your admin session has expired.');

    if (isEdit && productId) {
      await fetchApi<Product>(`/products/${productId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
      });
      showToast(`Updated masterpiece “${payload.name}”.`);
    } else {
      await fetchApi<Product>('/products', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });
      showToast(`Published new masterpiece “${payload.name}”.`);
    }
    await loadDashboard();
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Remove “${item.name}” from the live catalog? This will also remove managed ImageKit imagery.`)) return;
    const token = await requestToken();
    if (!token) throw new Error('Your admin session has expired.');
    await fetchApi(`/products/${item.productId}`, { method: 'DELETE', token });
    showToast(`Removed ${item.name} from the catalog.`);
    await loadDashboard();
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-5"><div className="h-8 w-64 bg-[#EAE4DC] rounded" /><div className="h-96 bg-[#F5F2ED] rounded" /></div>;
  if (authorized === false) return <div className="max-w-xl mx-auto py-24 text-center space-y-3"><AlertCircle className="w-9 h-9 text-[#A34D3D] mx-auto" /><h1 className="font-serif text-2xl font-bold">Admin access denied</h1><p className="text-sm text-[#5C5248]">Your Clerk role and server-side email allowlist must both grant access.</p></div>;
  if (error) return <div className="max-w-xl mx-auto py-24 text-center space-y-3"><AlertCircle className="w-9 h-9 text-[#A34D3D] mx-auto" /><p className="text-sm text-red-700">{error}</p><button onClick={() => void loadDashboard()} className="px-4 py-2 bg-[#8B5A2B] text-white text-xs rounded">Retry</button></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Studio Administration', href: '#' }, { label: 'Product Catalog' }]} />
      {toastMessage && (
        <div className="p-3 rounded bg-[#FFFDF5] border border-[#D4AF37]/30 flex justify-between text-xs">
          <span className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8B5A2B]" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <AdminHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDeity={selectedDeity}
        onDeityChange={setSelectedDeity}
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCsv={() => showToast('CSV export is not available yet.')}
        onAddProduct={handleOpenAddProduct}
      />
      <AdminMetrics
        lowStockCount={lowStockCount}
        onContactWorkshop={() => showToast('Please use the atelier contact directory.')}
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <AdminSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          lowStockCount={lowStockCount}
        />
        <main className="flex-1 w-full min-w-0 space-y-5">
          <AdminInventoryTable
            items={filteredItems}
            onOpenAdjuster={(item) => {
              setAdjusterItem(item);
              setIsAdjusterOpen(true);
            }}
            onDelete={handleDelete}
            onEdit={handleEditProduct}
          />
          <section className="p-4 rounded-lg bg-[#FFFDF5] border border-[#D4AF37]/25">
            <h2 className="font-serif font-bold text-sm text-[#3A2D20]">Recent Inventory Audit</h2>
            <div className="mt-3 space-y-2 text-xs">
              {ledger.length ? (
                ledger.map((entry) => (
                  <div key={entry.id} className="flex justify-between border-t border-[#D4AF37]/15 pt-2 font-serif">
                    <span className="text-[#3A2D20]">
                      {entry.reason}
                      {entry.note ? ` — ${entry.note}` : ''}
                    </span>
                    <span className={entry.delta >= 0 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                      {entry.delta >= 0 ? '+' : ''}
                      {entry.delta}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[#5C5248]">No ledger entries yet.</p>
              )}
            </div>
          </section>
        </main>
      </div>
      <QuickStockAdjuster
        isOpen={isAdjusterOpen}
        onClose={() => setIsAdjusterOpen(false)}
        item={adjusterItem}
        onSaveStock={handleSaveStock}
      />
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        locations={locations}
        onSaveProduct={handleSaveProduct}
        token={authToken}
      />
    </div>
  );
};
