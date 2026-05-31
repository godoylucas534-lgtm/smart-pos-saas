import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchStorePolicy, updateStorePolicy, type StoreAccessPolicy } from '../api/saas-admin.api';
import { PageError, PageLoading } from '@/components/ui/PageState';

interface PolicyModalProps {
  storeId: string;
  storeName: string;
  onClose: () => void;
}

function fmtDateForInput(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export default function PolicyModal({ storeId, storeName, onClose }: PolicyModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    accessBlockedUntil: '',
    autoReactivateAt: '',
    customSuspendMessage: '',
    supportContact: '',
  });

  const policyQuery = useQuery({
    queryKey: ['saas-admin', 'policy', storeId],
    queryFn: () => fetchStorePolicy(storeId),
  });

  useEffect(() => {
    if (policyQuery.data) {
      setForm({
        accessBlockedUntil: fmtDateForInput(policyQuery.data.accessBlockedUntil),
        autoReactivateAt: fmtDateForInput(policyQuery.data.autoReactivateAt),
        customSuspendMessage: policyQuery.data.customSuspendMessage || '',
        supportContact: policyQuery.data.supportContact || '',
      });
    }
  }, [policyQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      updateStorePolicy(storeId, {
        accessBlockedUntil: data.accessBlockedUntil ? new Date(data.accessBlockedUntil).toISOString() : null,
        autoReactivateAt: data.autoReactivateAt ? new Date(data.autoReactivateAt).toISOString() : null,
        customSuspendMessage: data.customSuspendMessage || null,
        supportContact: data.supportContact || null,
      }),
    onSuccess: () => {
      toast.success('Política actualizada correctamente');
      qc.invalidateQueries({ queryKey: ['saas-admin', 'policy', storeId] });
      onClose();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'No se pudo actualizar la política'),
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-auto rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Política de Acceso</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{storeName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            ✕
          </button>
        </div>

        {policyQuery.isLoading ? (
          <PageLoading message="Cargando política..." />
        ) : policyQuery.isError ? (
          <PageError message="No se pudo cargar la política." />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bloquear acceso hasta</label>
              <input
                type="datetime-local"
                className="ui-input w-full"
                value={form.accessBlockedUntil}
                onChange={(e) => setForm({ ...form, accessBlockedUntil: e.target.value })}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Si se define, las operaciones de escritura serán bloqueadas hasta esta fecha.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reactivar automáticamente el</label>
              <input
                type="datetime-local"
                className="ui-input w-full"
                value={form.autoReactivateAt}
                onChange={(e) => setForm({ ...form, autoReactivateAt: e.target.value })}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Fecha en la que el acceso se restablecerá automáticamente.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensaje personalizado de suspensión</label>
              <textarea
                className="ui-input w-full resize-none"
                rows={3}
                value={form.customSuspendMessage}
                onChange={(e) => setForm({ ...form, customSuspendMessage: e.target.value })}
                placeholder="Ej: Tu cuenta ha sido suspendida por incumplimiento de términos. Contacta a soporte."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contacto de soporte</label>
              <input
                type="text"
                className="ui-input w-full"
                value={form.supportContact}
                onChange={(e) => setForm({ ...form, supportContact: e.target.value })}
                placeholder="Ej: https://wa.me/595981000000 o soporte@ejemplo.com"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Este contacto se mostrará al usuario cuando su cuenta esté bloqueada.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 ui-button ui-button-ghost py-3">
                Cancelar
              </button>
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className="flex-1 ui-button ui-button-primary py-3"
              >
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}