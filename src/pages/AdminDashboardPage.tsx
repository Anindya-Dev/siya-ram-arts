import React, { useState } from 'react';
import { InventoryItem, Product } from '../types';
import { INITIAL_INVENTORY, PRODUCTS } from '../data/products';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminMetrics } from '../components/admin/AdminMetrics';
import { AdminAlertBanner } from '../components/admin/AdminAlertBanner';
import { AdminInventoryTable } from '../components/admin/AdminInventoryTable';
import { QuickStockAdjuster } from '../components/admin/QuickStockAdjuster';
import { AddProductModal, NewProductPayload } from '../components/admin/AddProductModal';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { CheckCircle2, X } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('catalog');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quick Stock Adjuster Modal State
  const [adjusterItem, setAdjusterItem] = useState<InventoryItem | null>(null);
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute Low Stock count
  const lowStockCount = inventory.filter((item) => item.status === 'Low Stock').length;

  // Filter items
  const filteredItems = inventory.filter((item) => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchDeity = item.deityForm.toLowerCase().includes(q);
      const matchAtelier = item.atelier.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchDeity && !matchAtelier) return false;
    }

    // Deity filter
    if (selectedDeity !== 'All') {
      if (!item.deityForm.toLowerCase().includes(selectedDeity.toLowerCase())) {
        return false;
      }
    }

    // Material filter
    if (selectedMaterial !== 'All') {
      if (!item.materialPurity.toLowerCase().includes(selectedMaterial.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== 'All') {
      if (item.status !== selectedStatus) {
        return false;
      }
    }

    return true;
  });

  const handleOpenAdjuster = (item: InventoryItem) => {
    setAdjusterItem(item);
    setIsAdjusterOpen(true);
  };

  const handleSaveStock = (
    itemId: string,
    variantSize: string,
    newCount: number,
    reason: string,
    notifyCarver: boolean
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // Update target variant
        const updatedVariants = item.variants.map((v) => {
          if (v.size === variantSize) {
            const newStatus =
              newCount === 0
                ? ('Out of Stock' as const)
                : newCount <= v.threshold
                ? ('Low Stock' as const)
                : ('In Stock' as const);
            return {
              ...v,
              stock: newCount,
              status: newStatus,
            };
          }
          return v;
        });

        // Determine overall item status
        const hasLow = updatedVariants.some((v) => v.stock <= v.threshold && v.stock > 0);
        const allOut = updatedVariants.every((v) => v.stock === 0);
        const overallStatus = allOut
          ? ('Out of Stock' as const)
          : hasLow
          ? ('Low Stock' as const)
          : ('In Stock' as const);

        return {
          ...item,
          status: overallStatus,
          variants: updatedVariants,
        };
      })
    );

    setToastMessage(
      `Updated inventory for ${variantSize} to ${newCount} units. (${reason})`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'SKU',
      'Name',
      'Deity',
      'Material',
      'Price (INR)',
      'Stock Status',
      'Variants',
    ];
    const rows = inventory.map((item) => [
      item.id,
      item.sku,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.deityForm}"`,
      `"${item.materialPurity}"`,
      item.basePrice,
      item.status,
      `"${item.variants.map((v) => `${v.size}: ${v.stock}`).join('; ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SiyaRamArts_Inventory_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported inventory ledger to SiyaRamArts_Inventory_Export.csv');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleContactWorkshop = () => {
    setToastMessage(
      'Connected to Jalandhar Master Carver desk (WhatsApp +91 98765 43210).'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReviewPreOrders = () => {
    setToastMessage(
      'Viewing 4 pre-orders waiting for Akshaya Tritiya Ram Lalla consecration.'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitRequisition = () => {
    setToastMessage(
      'Requisition #REQ-2025-084 sent to Jalandhar Master Sculptor atelier for 4 additional Ram Lalla pieces.'
    );
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSaveNewProduct = (payload: NewProductPayload) => {
    const newId = `prod-${Date.now()}`;
    const newSlug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newProduct: Product = {
      id: newId,
      slug: newSlug,
      name: payload.name,
      deity: payload.deity,
      deityForm: payload.deity,
      material: payload.material,
      materialPurity: payload.material,
      basePrice: payload.basePrice,
      originalPrice: payload.originalPrice,
      rating: 5.0,
      reviewCount: 1,
      sku: payload.sku,
      atelier: 'Jalandhar Atelier',
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
      images: [{ src: payload.imageSrc, alt: payload.name, isPrimary: true }],
      variants: [
        {
          id: `${newId}-var-1`,
          size: payload.dimensions,
          stockCount: payload.stockCount,
          priceDelta: 0,
          status: payload.status,
        },
      ],
      specifications: {
        canonicalForm: payload.deity,
        primaryMedium: payload.material,
        ornamentationGrade: '24K Gold Leaf Vark & Real Emerald Coloration',
        mudrasAttributes: 'Abhaya Mudra & Blessings',
        pedestalFoundation: 'Hand-Carved Base',
        archComposition: 'Sacred Prabhavali',
        authenticationSeal: 'Jalandhar SRA Master Seal',
        netWeight: payload.dimensions.split('•')[1]?.trim() || '6.5 kg',
        heightWidth: payload.dimensions.split('•')[0]?.trim() || '12-inch',
        provenance: 'Jalandhar, Punjab',
        pratishthaStatus: 'Temple Consecrated',
      },
      sevaGuidelines: {
        panchamritAbhishek: 'Wipe gently with clean soft cotton after jal abhishek.',
        goldFoilCare: 'Clean gold foil accents with micro-fiber cloth.',
        chandanKumkum: 'Apply chandan tilak on forehead during morning puja.',
        transitInstallation: 'Position on raised sanctum altar facing East/North-East.',
      },
      tags: ['Handcrafted', payload.deity, 'Sacred Vigraha'],
      certificateNumber: `SRA-JAL-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Prepend to PRODUCTS customer catalog array
    PRODUCTS.unshift(newProduct);

    // Prepend to Admin Inventory Table
    const newInventoryItem: InventoryItem = {
      id: newId,
      productId: newId,
      name: payload.name,
      sku: payload.sku,
      atelier: 'Jalandhar Atelier',
      deityForm: payload.deity,
      materialPurity: payload.material,
      sizeAndWeight: payload.dimensions,
      basePrice: payload.basePrice,
      status: payload.status,
      variants: [
        {
          size: payload.dimensions.split('•')[0]?.trim() || '12-inch',
          stock: payload.stockCount,
          threshold: 2,
          unit: 'pcs',
          status: payload.status === 'In Stock' ? 'Healthy' : 'Low Stock',
        },
      ],
    };

    setInventory((prev) => [newInventoryItem, ...prev]);

    setToastMessage(
      `Successfully added "${payload.name}" (SKU: ${payload.sku}) to live catalog & inventory!`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#' },
          { label: 'Studio Administration', href: '#' },
          { label: 'Product Catalog' },
        ]}
      />

      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-md bg-[#FFFDF5] border border-[#D4AF37]/30 text-[#3A2D20] text-xs font-serif flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8B5A2B]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8C8276] hover:text-[#3A2D20] p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header with Functional Controls */}
      <AdminHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDeity={selectedDeity}
        onDeityChange={setSelectedDeity}
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCsv={handleExportCsv}
        onAddProduct={() => setIsAddModalOpen(true)}
      />

      {/* Metrics Row */}
      <AdminMetrics
        lowStockCount={lowStockCount}
        onContactWorkshop={handleContactWorkshop}
      />

      {/* Low Stock Requisition Alert */}
      <AdminAlertBanner
        onReviewPreOrders={handleReviewPreOrders}
        onSubmitRequisition={handleSubmitRequisition}
      />

      {/* Main Grid: Sidebar + Inventory Table */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <AdminSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 w-full min-w-0">
          <AdminInventoryTable
            items={filteredItems}
            onOpenAdjuster={handleOpenAdjuster}
          />
        </main>
      </div>

      {/* Quick Stock Adjuster */}
      <QuickStockAdjuster
        isOpen={isAdjusterOpen}
        onClose={() => setIsAdjusterOpen(false)}
        item={adjusterItem}
        onSaveStock={handleSaveStock}
      />

      {/* Add New Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveProduct={handleSaveNewProduct}
      />
    </div>
  );
};
