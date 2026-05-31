import { useAuthStore } from '@/stores/auth.store';

const WHATSAPP_SUPPORT_URL = 'https://wa.me/595981000000?text=Hola%20soporte%2C%20mi%20cuenta%20aparece%20suspendida%20y%20necesito%20reactivacion.';

export default function SuspendedAccountBanner() {
  const subscription = useAuthStore((s) => s.subscription);
  const user = useAuthStore((s) => s.user);
  const isSuspended = subscription?.status === 'suspended';
  const isSuperAdmin = user?.role === 'super_admin';

  if (!isSuspended || isSuperAdmin) return null;

  return (
    <div className="mx-4 md:mx-6 mt-4 ui-card border-red-500/40" style={{ background: 'rgba(220,74,88,0.08)' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="font-semibold text-red-200">Tu cuenta está suspendida por falta de pago.</p>
          <p className="text-sm text-red-100/90">Contactate con soporte para reactivación.</p>
        </div>
        <a className="ui-button ui-button-danger text-center" href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noreferrer">
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
