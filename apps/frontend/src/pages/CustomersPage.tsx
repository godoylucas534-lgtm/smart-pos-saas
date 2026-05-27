import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageEmpty, PageLoading } from '@/components/ui/PageState';
import { useCustomersQuery, useSaveCustomerMutation } from '@/features/customers/hooks/useCustomersQueries';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';

interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  documentType?: string;
  document?: string;
  birthDate?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  businessName?: string;
  taxDocument?: string;
  notes?: string;
  creditLimit?: number;
  totalOrders?: number;
  totalPurchases?: number;
}

const EMPTY_FORM: Customer = {
  id: '',
  firstName: '',
  lastName: '',
  documentType: 'CI',
  document: '',
  birthDate: '',
  phone: '',
  alternativePhone: '',
  email: '',
  address: '',
  city: '',
  businessName: '',
  taxDocument: '',
  notes: '',
  creditLimit: 0,
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Customer>(EMPTY_FORM);
  const customersQuery = useCustomersQuery(debouncedSearch);
  const saveMutation = useSaveCustomerMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const customers = customersQuery.data ?? [];
  const columns: DataColumn<Customer>[] = [
    { key: 'cliente', title: 'Cliente', render: (c) => `${c.firstName} ${c.lastName || ''}` },
    { key: 'documento', title: 'Documento', render: (c) => `${c.documentType || '-'} ${c.document || '-'}` },
    { key: 'contacto', title: 'Contacto', render: (c) => c.phone || c.email || '-' },
    { key: 'facturacion', title: 'Facturacion', render: (c) => c.businessName || c.taxDocument || '-' },
    { key: 'limite', title: 'Cred. Limite', align: 'right', render: (c) => Number(c.creditLimit || 0).toLocaleString('es-PY') },
    { key: 'compras', title: 'Compras', align: 'right', render: (c) => Number(c.totalPurchases || 0).toLocaleString('es-PY') },
    {
      key: 'acciones',
      title: 'Acciones',
      align: 'center',
      render: (c) => <button onClick={() => openEdit(c)} className="ui-button ui-button-primary text-xs px-2 py-1">Editar</button>,
    },
  ];

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ ...EMPTY_FORM, ...c, birthDate: c.birthDate ? c.birthDate.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName?.trim()) return toast.error('Nombre requerido');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Email invalido');
    if (Number(form.creditLimit || 0) < 0) return toast.error('Limite de credito invalido');

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        documentType: form.documentType || undefined,
        document: form.document || undefined,
        birthDate: form.birthDate || undefined,
        phone: form.phone || undefined,
        alternativePhone: form.alternativePhone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        businessName: form.businessName || undefined,
        taxDocument: form.taxDocument || undefined,
        notes: form.notes || undefined,
        creditLimit: Number(form.creditLimit || 0),
      };

      await saveMutation.mutateAsync({ id: editing?.id, payload });
      toast.success(editing ? 'Cliente actualizado' : 'Cliente creado');
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={openNew} className="ui-button ui-button-primary">+ Nuevo</button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, telefono, documento, razon social o RUC"
        className="ui-input w-full mb-4"
      />

      <div className="ui-card overflow-hidden">
        {customersQuery.isLoading ? <PageLoading /> : customers.length === 0 ? <PageEmpty message="No se encontraron clientes" /> : (
          <AdaptiveDataTable columns={columns} rows={customers} rowKey={(c) => c.id} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="ui-surface p-5 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Los campos con * son obligatorios. El resto es opcional.</p>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Datos personales</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="ui-input" placeholder="Nombre *" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <input className="ui-input" placeholder="Apellido (opcional)" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <select className="ui-input" value={form.documentType || 'CI'} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                <option value="CI">CI</option><option value="RUC">RUC</option><option value="Pasaporte">Pasaporte</option><option value="DNI">DNI</option>
              </select>
              <input className="ui-input" placeholder="Numero de documento (opcional)" value={form.document || ''} onChange={(e) => setForm({ ...form, document: e.target.value })} />
              <input type="date" className="ui-input" value={form.birthDate || ''} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Contacto</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="ui-input" placeholder="Telefono principal (opcional)" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="ui-input" placeholder="Telefono alternativo (opcional)" value={form.alternativePhone || ''} onChange={(e) => setForm({ ...form, alternativePhone: e.target.value })} />
              <input className="ui-input" placeholder="Email (opcional)" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="ui-input" placeholder="Direccion (opcional)" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input className="ui-input col-span-2" placeholder="Ciudad/Barrio (opcional)" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Para facturacion</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="ui-input" placeholder="Razon social (opcional)" value={form.businessName || ''} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              <input className="ui-input" placeholder="RUC con digito (opcional)" value={form.taxDocument || ''} onChange={(e) => setForm({ ...form, taxDocument: e.target.value })} />
            </div>
            <h3 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Otros</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input type="number" className="ui-input" placeholder="Limite de credito (Gs.) (opcional)" value={form.creditLimit || 0} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} />
              <textarea className="ui-input col-span-2" placeholder="Notas internas (opcional)" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="ui-button ui-button-ghost">Cancelar</button>
              <button onClick={handleSave} disabled={saveMutation.isPending} className="ui-button ui-button-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
