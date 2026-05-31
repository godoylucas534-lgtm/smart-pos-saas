import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { fetchMyStorePolicy } from '@/features/saas-admin/api/saas-admin.api';

const DEFAULT_WHATSAPP = 'https://wa.me/595981000000?text=Hola%20soporte%2C%20mi%20cuenta%20aparece%20suspendida%20y%20necesito%20reactivacion.';

export default function SuspendedAccountBanner() {
  const subscription = useAuthStore((s) => s.subscription);
  const user = useAuthStore((s) => s.user);
  const isSuspended = subscription?.status === 'suspended';
  const isSuperAdmin = user?.role === 'super_admin';

  const storeId = user?.storeId;

  const policyQuery = useQuery({
    queryKey: ['saas', 'policy', 'mine'],
    queryFn: fetchMyStorePolicy,
    enabled: isSuspended && !!storeId && !isSuperAdmin,
    staleTime: 60_000,
  });

  if (!isSuspended || isSuperAdmin) return null;

  const customMessage = policyQuery.data?.customSuspendMessage;
  const supportContact = policyQuery.data?.supportContact;
  const displayMessage = customMessage || 'Tu cuenta esta suspendida por falta de pago. Contactate con soporte para reactivacion.';
  const displayContact = supportContact || DEFAULT_WHATSAPP;
  const isUrl = displayContact.startsWith('http://') || displayContact.startsWith('https://') || displayContact.startsWith('wa.me') || displayContact.startsWith('tel:');

  return (
    <div className="mx-4 md:mx-6 mt-4 rounded-xl border p-4" style={{ background: 'rgba(220,74,88,0.08)', borderColor: 'rgba(220,74,88,0.3)' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold" style={{ color: 'var(--danger)' }}>Acceso restringido</p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{displayMessage}</p>
        </div>
        {isUrl ? (
          <a
            className="inline-flex items-center gap-2 ui-button ui-button-danger text-center shrink-0"
            href={displayContact}
            target="_blank"
            rel="noreferrer"
          >
            Contactar soporte
          </a>
        ) : (
          <p className="text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>
            {displayContact}
          </p>
        )}
      </div>
    </div>
  );
}

