import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageEmpty, PageLoading } from '@/components/ui/PageState';
import {
  useCreateCategoryMutation,
  useProductCategoriesQuery,
  useProductMovementsQuery,
  useProductsQuery,
  useSaveProductMutation,
} from '@/features/products/hooks/useProductsQueries';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';
import { formatCurrencyPYG, formatStockInt } from '@/lib/utils';
import { buildProductPayload } from '@/features/products/api/products.api';

interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  supplier?: string;
  salePrice: number;
  costPrice: number;
  taxRate: number;
  stock: number;
  stockMin: number;
  unit: string;
  trackStock: boolean;
  isBulk: boolean;
  imageUrl?: string;
  notes?: string;
  isActive: boolean;
  category?: { id: string; name: string; color: string };
}

const EMPTY_FORM: Partial<Product> = {
  name: '',
  description: '',
  categoryId: '',
  brand: '',
  supplier: '',
  sku: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  taxRate: 10,
  stock: 0,
  stockMin: 5,
  unit: 'unidad',
  trackStock: true,
  isBulk: false,
  imageUrl: '',
  notes: '',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM);
  const [catForm, setCatForm] = useState({ name: '', color: '#4f46e5' });
  const [showHistory, setShowHistory] = useState(false);
  const [historyProduct, setHistoryProduct] = useState('');
  const [historyProductId, setHistoryProductId] = useState('');

  const productsQuery = useProductsQuery(debouncedSearch);
  const categoriesQuery = useProductCategoriesQuery();
  const historyQuery = useProductMovementsQuery(historyProductId, showHistory && !!historyProductId);
  const saveMutation = useSaveProductMutation();
  const createCategoryMutation = useCreateCategoryMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const columns: DataColumn<Product>[] = [
    { key: 'product', title: 'Producto', render: (p) => p.name },
    { key: 'sku', title: 'SKU', render: (p) => p.sku || '-' },
    { key: 'price', title: 'Precio', align: 'right', render: (p) => formatCurrencyPYG(p.salePrice) },
    { key: 'stock', title: 'Stock', align: 'right', render: (p) => formatStockInt(p.stock) },
    { key: 'stockMin', title: 'Stock min', align: 'right', render: (p) => formatStockInt(p.stockMin) },
    { key: 'status', title: 'Estado', align: 'center', render: (p) => (p.isActive ? 'Activo' : 'Inactivo') },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      render: (p) => (
        <div className="flex gap-2 justify-center">
          <button onClick={() => openEdit(p)} className="ui-button ui-button-primary text-xs px-2 py-1">Editar</button>
          <button onClick={() => handleHistory(p)} className="ui-button ui-button-ghost text-xs px-2 py-1">Historial</button>
        </div>
      ),
    },
  ];

  const margin = Number(form.costPrice || 0) > 0
    ? ((Number(form.salePrice || 0) - Number(form.costPrice || 0)) / Number(form.costPrice || 1)) * 100
    : 0;

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...EMPTY_FORM,
      ...p,
      stock: Number(p.stock || 0),
      stockMin: Number(p.stockMin || 0),
      categoryId: p.category?.id || p.categoryId || '',
      notes: (p as any)?.metadata?.notes || (p as any)?.notes || '',
    } as any);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Nombre requerido');
    if (Number(form.salePrice || 0) <= 0) return toast.error('Precio de venta debe ser mayor a 0');
    if (Number(form.stock || 0) < 0) return toast.error('Stock no puede ser negativo');

    try {
      const payload = buildProductPayload({
        name: form.name,
        sku: form.sku,
        description: form.description,
        barcode: form.barcode,
        categoryId: form.categoryId,
        brand: form.brand,
        supplier: form.supplier,
        costPrice: form.costPrice,
        salePrice: form.salePrice,
        stock: form.stock,
        stockMin: form.stockMin,
        taxRate: form.taxRate,
        unit: form.unit,
        trackStock: form.trackStock,
        isBulk: form.isBulk,
        imageUrl: form.imageUrl,
        notes: (form as any).notes,
        isActive: form.isActive,
      });
      console.debug('[ProductsPage] update payload', payload);

      await saveMutation.mutateAsync({ id: editing?.id, payload });
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      toast.success('Producto guardado');
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const handleHistory = (p: Product) => {
    setHistoryProduct(p.name);
    setHistoryProductId(p.id);
    setShowHistory(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion de Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)} className="ui-button ui-button-ghost">Categorias</button>
          <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }} className="ui-button ui-button-primary">+ Nuevo</button>
        </div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto" className="ui-input w-full mb-4" />

      <div className="ui-card overflow-hidden">
        {productsQuery.isLoading ? <PageLoading /> : products.length === 0 ? <PageEmpty message="No se encontraron productos" /> : (
          <AdaptiveDataTable columns={columns} rows={products} rowKey={(p) => p.id} />
        )}
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="ui-surface w-full max-w-3xl max-h-[90vh] overflow-auto p-5">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">Historial de {historyProduct}</h2><button onClick={() => setShowHistory(false)}>X</button></div>
            {historyQuery.isLoading ? <PageLoading /> : (
              <AdaptiveDataTable
                columns={[
                  { key: 'date', title: 'Fecha', render: (m: any) => new Date(m.createdAt).toLocaleString('es-PY') },
                  { key: 'type', title: 'Tipo', render: (m: any) => m.type },
                  { key: 'qty', title: 'Cantidad', align: 'right', render: (m: any) => formatStockInt(m.quantity) },
                  { key: 'prev', title: 'Anterior', align: 'right', render: (m: any) => formatStockInt(m.previousStock) },
                  { key: 'next', title: 'Nuevo', align: 'right', render: (m: any) => formatStockInt(m.newStock) },
                  { key: 'ref', title: 'Referencia', render: (m: any) => m.reference || '-' },
                ]}
                rows={history}
                rowKey={(m: any) => m.id}
                density="compact"
              />
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="ui-surface p-5 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-3">{editing ? 'Editar' : 'Nuevo'} producto</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Los campos con * son obligatorios. El resto es opcional.</p>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Informacion basica</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="ui-input" placeholder="Nombre del producto *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="ui-input" placeholder="Descripcion (opcional)" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select className="ui-input" value={form.categoryId || ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Sin categoria</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="ui-input" placeholder="Marca (opcional)" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <input className="ui-input" placeholder="Proveedor (opcional)" value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              <input className="ui-input" placeholder="Codigo interno SKU (opcional)" value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <div className="col-span-2 flex gap-2">
                <input className="ui-input flex-1" placeholder="Codigo de barras (opcional)" value={form.barcode || ''} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                <button type="button" onClick={() => setForm({ ...form, barcode: '' })} className="ui-button ui-button-ghost">Limpiar</button>
              </div>
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Precios</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" className="ui-input" placeholder="Precio de costo (Gs.)" value={form.costPrice || 0} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
              <input type="number" className="ui-input" placeholder="Precio de venta (Gs.) *" value={form.salePrice || 0} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} />
              <input readOnly className="ui-input" value={`Margen: ${margin.toFixed(2)}%`} />
              <select className="ui-input" value={form.taxRate || 10} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}>
                <option value={0}>Exento 0%</option><option value={5}>IVA 5%</option><option value={10}>IVA 10%</option>
              </select>
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Stock</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" min={0} step={1} inputMode="numeric" className="ui-input" placeholder="Stock actual" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              <input type="number" min={0} step={1} inputMode="numeric" className="ui-input" placeholder="Stock minimo" value={form.stockMin || 0} onChange={(e) => setForm({ ...form, stockMin: Number(e.target.value) })} />
              <select className="ui-input" value={form.unit || 'unidad'} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="unidad">Unidad</option><option value="kg">Kg</option><option value="gramo">Gramo</option><option value="litro">Litro</option><option value="metro">Metro</option><option value="caja">Caja</option><option value="par">Par</option><option value="docena">Docena</option>
              </select>
              <div className="flex items-center gap-4">
                <label className="text-sm"><input type="checkbox" checked={!!form.trackStock} onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} /> Controlar stock</label>
                <label className="text-sm"><input type="checkbox" checked={!!form.isBulk} onChange={(e) => setForm({ ...form, isBulk: e.target.checked })} /> Producto a granel</label>
              </div>
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Informacion adicional (opcional)</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="ui-input col-span-2" placeholder="Imagen URL" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <textarea className="ui-input col-span-2" rows={2} placeholder="Notas internas" value={(form as any).notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value } as any)} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="ui-button ui-button-ghost">Cancelar</button>
              <button onClick={handleSave} disabled={saveMutation.isPending} className="ui-button ui-button-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="ui-surface p-5 w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">Nueva categoria</h2>
            <input className="ui-input w-full mb-2" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nombre" />
            <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowCatModal(false)} className="ui-button ui-button-ghost">Cerrar</button>
              <button
                onClick={async () => {
                  if (!catForm.name.trim()) return;
                  await createCategoryMutation.mutateAsync(catForm);
                  setShowCatModal(false);
                }}
                className="ui-button ui-button-primary"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
