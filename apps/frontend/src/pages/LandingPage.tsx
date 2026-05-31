import { useState } from 'react';
import { Link } from 'react-router-dom';

const whatsappUrl = 'https://wa.me/595971264523?text=Hola%2C%20quiero%20informacion%20del%20POS%20para%20mi%20negocio.';

const businessTypes = [
  {
    id: 'despensas',
    name: 'Despensas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Control total de tus ventas diarias',
    desc: 'Ideal para despensas locales. Deja atrás los cuadernos borrosos y conoce exactamente cuánto dinero entra por caja.',
    bullets: [
      'Registro de mercadería en segundos por lector o búsqueda rápida.',
      'Control preciso de fiados agrupados por vecino.',
      'Alertas de stock bajo para reponer la yerba o leche a tiempo.',
      'Cierre de caja transparente sin diferencias al terminar el día.'
    ]
  },
  {
    id: 'minimercados',
    name: 'Minimercados',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Velocidad de atención y múltiples cajas',
    desc: 'Mantén a tus clientes fluyendo rápido con un sistema ágil que no se cuelga ni te hace perder tiempo.',
    bullets: [
      'Soporte para múltiples cajeros con contraseñas individuales.',
      'Ventas rápidas con códigos de barras y balanza.',
      'Informes automáticos de ganancias netas del mes.',
      'Gestión masiva de inventarios para cargas rápidas.'
    ]
  },
  {
    id: 'ferreterias',
    name: 'Ferreterías',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Miles de repuestos bajo control',
    desc: 'Ordena el stock de tornillos, herramientas y pinturas sin volverte loco. Encuentra todo al instante.',
    bullets: [
      'Búsqueda por palabras clave o códigos específicos.',
      'Control de unidades sueltas, bolsas o cajas completas.',
      'Ajuste rápido de precios ante variaciones de proveedores.',
      'Seguimiento visual del stock crítico de ferretería.'
    ]
  },
  {
    id: 'tiendas',
    name: 'Tiendas pequeñas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title: 'Estilo y control para tu boutique',
    desc: 'Ideal para bazares, tiendas de ropa, calzados o cosméticos. Gestiona tu inventario con total claridad comercial.',
    bullets: [
      'Registro fácil de variantes como talles, colores o marcas.',
      'Tickets de venta limpios para tus clientes.',
      'Visualiza qué productos no se están vendiendo y arma promociones.',
      'Fácil registro de gastos locales para calcular ganancias reales.'
    ]
  },
  {
    id: 'fiado',
    name: 'Negocios con fiado',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'El fin del cuaderno de cuentas pendientes',
    desc: 'Controla el fiado de tus clientes de forma digital. Ten el saldo pendiente siempre claro en segundos.',
    bullets: [
      'Historial exacto de cada entrega y abono realizado.',
      'Visualiza en rojo a los deudores con más de 30 días de retraso.',
      'Exporta la cuenta de fiado para enviarla directamente por WhatsApp.',
      'Evita malentendidos con cuentas automáticas sin errores de suma.'
    ]
  }
];

const smartAlertsList = [
  {
    title: 'Stock Crítico',
    desc: 'Yerba Mate Kurupí Menta y Limón está por debajo de 3 unidades.',
    time: 'Hace 5 min',
    type: 'danger'
  },
  {
    title: 'Fiado Pendiente',
    desc: 'Don Ramón superó el límite establecido de Gs. 250.000.',
    time: 'Hace 1 hora',
    type: 'warning'
  },
  {
    title: 'Cierre de Caja',
    desc: 'Caja del Turno Tarde cerrada con éxito. ¡Todo coincide!',
    time: 'Hace 2 horas',
    type: 'success'
  }
];

const services = [
  {
    title: 'Landing Pages Profesionales',
    description: 'Páginas web modernas a medida y enfocadas en conversión para captar clientes en Paraguay de forma efectiva.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Sistemas Web Full Stack a Medida',
    description: 'Aplicaciones robustas con base de datos, backend veloz y frontend interactivo adaptado a tu modelo de negocio.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: 'Tiendas Online (E-commerce)',
    description: 'Vende tus productos 24/7 con carritos de compra autogestionables, pasarelas de pago y control de stock.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    title: 'Sistemas Multi-sucursales',
    description: 'Controla el inventario de múltiples locales de forma centralizada y unificada en tiempo real.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: 'Paneles Administrativos / Dashboards',
    description: 'Herramientas de Business Intelligence para analizar tus ingresos, gastos, comisiones y métricas de crecimiento.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: 'Integraciones y Automatizaciones',
    description: 'Conexión automática con alertas de WhatsApp, facturación electrónica local y sincronización con otros softwares.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Mantenimiento y Soporte Evolutivo',
    description: 'Acompañamiento continuo, actualizaciones de seguridad y desarrollo de nuevas funcionalidades según tu negocio crezca.',
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

const testimonials = [
  {
    name: 'Don Ramón Galeano',
    role: 'Propietario de Despensa San Cayetano',
    location: 'San Lorenzo, PY',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    text: '“Dejé por completo el cuaderno. Ahora busco el nombre del vecino en el sistema y me dice exacto cuánto me debe. Los clientes ven que todo es transparente y da gusto cobrar así.”'
  },
  {
    name: 'Lic. Laura Benítez',
    role: 'Administradora de Minimercado El Trébol',
    location: 'Luque, PY',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    text: '“Lo mejor es que la caja cierra perfecta al final de cada turno. Antes perdíamos mucho tiempo sumando boletas de papel. El soporte por WhatsApp es súper rápido.”'
  },
  {
    name: 'Carlos Mendoza',
    role: 'Dueño de Ferretería La Grapadora',
    location: 'Capiatá, PY',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    text: '“Tengo más de 5,000 productos. El buscador del POS me permite encontrar arandelas, cables y caños al instante. Ya sé qué tengo que reponer antes de que se me agote.”'
  }
];

const faqList = [
  {
    q: '¿Tengo que instalar algún programa pesado en mi computadora?',
    a: 'No. El sistema corre directo desde tu navegador web o celular de manera fluida. Es rápido, no consume recursos y se actualiza de forma automática y gratuita.'
  },
  {
    q: '¿Cómo me ayuda a controlar mis cuentas de fiado?',
    a: 'Cada venta de fiado se asocia a la cuenta corriente del cliente. Podés ver el saldo deudor consolidado en segundos, imprimir su estado o enviárselo directamente por WhatsApp con un solo clic.'
  },
  {
    q: '¿Qué pasa si tengo problemas? ¿Ofrecen soporte en Paraguay?',
    a: 'Sí. Ofrecemos soporte directo y personalizado a través de WhatsApp. Te ayudamos a cargar tus primeros productos y a configurar todo el sistema para que empieces sin dolores de cabeza.'
  },
  {
    q: '¿Los planes tienen algún contrato de permanencia a largo plazo?',
    a: 'Para nada. Pagás mes a mes según tu conveniencia. Podés cancelar o cambiar de plan cuando quieras, sin letra chica ni multas ocultas.'
  },
  {
    q: '¿Puedo importar mi lista de productos si ya la tengo en Excel?',
    a: 'Sí, claro. Te ayudamos a migrar tus datos de Excel directamente al sistema para que no pierdas horas cargando producto por producto a mano.'
  },
  {
    q: '¿Se requiere internet constante para vender?',
    a: 'El sistema funciona idealmente conectado, pero ante micro-cortes temporales de internet podés seguir operando la venta del momento sin interrumpir la atención de tus clientes.'
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('despensas');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const activeTabData = businessTypes.find((tab) => tab.id === activeTab) || businessTypes[0];

  return (
    <div className="min-h-screen text-slate-100 bg-[#0b0f19] font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[30%] left-10 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">SmartPOS</span>
              <span className="text-xs block text-slate-400 font-semibold leading-none">Paraguay</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problemas" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">Problemas</a>
            <a href="#beneficios" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">Beneficios</a>
            <a href="#funciones" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">Funcionalidades</a>
            <a href="#precios" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">Precios</a>
            <a href="#otros-servicios" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">Otros Servicios</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors font-medium">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white font-semibold transition-colors">
              Ingresar
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.518.003 10.01-4.485 10.013-10.004.002-2.673-1.04-5.184-2.937-7.082C16.452 1.621 13.945.575 11.27.575c-5.52 0-10.011 4.49-10.014 10.011-.002 1.91.498 3.774 1.448 5.376L1.724 21.8l6.096-1.597-.173-.049z" />
              </svg>
              Soporte WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" aria-label="Menu">
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0b0f19] px-4 py-4 space-y-3">
            <a href="#problemas" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">Problemas</a>
            <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">Beneficios</a>
            <a href="#funciones" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">Funcionalidades</a>
            <a href="#precios" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">Precios</a>
            <a href="#otros-servicios" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">Otros Servicios</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-base text-slate-300 hover:text-emerald-400 transition-colors">FAQ</a>
            <div className="pt-4 border-t border-slate-850 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl font-semibold border border-slate-700 text-slate-300 hover:text-white transition-all">
                Ingresar
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.518.003 10.01-4.485 10.013-10.004.002-2.673-1.04-5.184-2.937-7.082C16.452 1.621 13.945.575 11.27.575c-5.52 0-10.011 4.49-10.014 10.011-.002 1.91.498 3.774 1.448 5.376L1.724 21.8l6.096-1.597-.173-.049z" />
                </svg>
                Conversar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-10 pb-20 md:pt-16 md:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  POS Inteligente & Sencillo en Paraguay
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
                  Controlá tu Stock, Caja y <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Fiados en un solo lugar</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                  Diseñado especialmente para despensas, minimercados y ferreterías de Paraguay. Deja atrás los cuadernos perdidos y sumá ganancias reales con avisos automáticos de tu negocio.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <Link to="/register" className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                    Probar Demo Gratis
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center border border-slate-700 bg-slate-900/55 hover:bg-slate-800/80 text-white font-semibold px-8 py-4 rounded-2xl hover:border-slate-600 transition-all">
                    <svg className="w-5 h-5 mr-2 fill-emerald-400" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.518.003 10.01-4.485 10.013-10.004.002-2.673-1.04-5.184-2.937-7.082C16.452 1.621 13.945.575 11.27.575c-5.52 0-10.011 4.49-10.014 10.011-.002 1.91.498 3.774 1.448 5.376L1.724 21.8l6.096-1.597-.173-.049z" />
                    </svg>
                    WhatsApp Comercial
                  </a>
                </div>

                {/* Micro Metrics Trust */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0">
                  <div>
                    <span className="block text-2xl font-black text-white">Gs. 0</span>
                    <span className="text-xs text-slate-400">Costo de instalación</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">100%</span>
                    <span className="text-xs text-slate-400">Garantía de soporte</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">En línea</span>
                    <span className="text-xs text-slate-400">Demo disponible</span>
                  </div>
                </div>
              </div>

              {/* Right Column - SaaS Mock Dashboard */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 rounded-3xl blur-2xl -z-10" />
                <div className="border border-slate-700/80 bg-slate-900/90 rounded-3xl p-6 shadow-2xl space-y-6">
                  {/* Mock Window Control */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">pos.smartpos.com.py/dashboard</span>
                  </div>

                  {/* Dashboard Content */}
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-200">Panel del Comercio</h4>
                        <p className="text-[10px] text-slate-400">Estado de hoy en vivo</p>
                      </div>
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Caja Abierta
                      </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ventas del día</span>
                        <div className="font-extrabold text-sm text-white mt-1">Gs. 1.840.000</div>
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-bold">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          +12% hoy vs ayer
                        </span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fiados por Cobrar</span>
                        <div className="font-extrabold text-sm text-red-400 mt-1">Gs. 320.000</div>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">4 vecinos con saldo</span>
                      </div>
                    </div>

                    {/* Alerts Container */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avisos Inteligentes</span>
                      <div className="space-y-2">
                        {smartAlertsList.map((alert, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 text-xs">
                            <div className="flex items-start gap-2.5">
                              {alert.type === 'danger' && <span className="text-red-400 mt-0.5">⚠️</span>}
                              {alert.type === 'warning' && <span className="text-yellow-400 mt-0.5">🔔</span>}
                              {alert.type === 'success' && <span className="text-emerald-400 mt-0.5">✓</span>}
                              <div>
                                <p className="font-bold text-slate-200">{alert.title}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{alert.desc}</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500 font-medium shrink-0">{alert.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section id="problemas" className="py-20 border-t border-slate-900 bg-slate-950/40 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">El costo de la desorganización</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Tu negocio te da tranquilidad o te quita el sueño?</h2>
              <p className="text-slate-400">
                La mayoría de los pequeños comercios en Paraguay pierden entre un 10% y un 15% de sus ingresos mensuales por pequeños errores de control diario.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fugas silenciosas de dinero</h3>
                <p className="text-sm text-slate-400">
                  Vender sin registrar montos exactos hace imposible saber si hay pérdidas sistemáticas o cobros mal hechos.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">El cuaderno de fiados perdido</h3>
                <p className="text-sm text-slate-400">
                  Las anotaciones se manchan, se traspapelan o se olvidan de anotar, provocando discusiones con los clientes y dinero perdido.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V17l8 4m0-13V9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Stock sin control real</h3>
                <p className="text-sm text-slate-400">
                  Quedarte sin artículos clave en el momento más concurrido o almacenar mercadería que no rota, congelando tu capital de trabajo.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl hover:border-red-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cierres de caja estresantes</h3>
                <p className="text-sm text-slate-400">
                  Estar hasta altas horas de la noche contando billetes y sumando comprobantes a mano para saber si los números coinciden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section by Business Type */}
        <section id="beneficios" className="py-20 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Adaptado a vos</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Un beneficio directo para cada tipo de negocio</h2>
              <p className="text-slate-400">
                Seleccioná el tipo de comercio que gestionás y descubrí cómo el POS inteligente resuelve tus desafíos diarios.
              </p>
            </div>

            {/* Tabs Selector */}
            <div className="mt-10 flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-4xl mx-auto">
              {businessTypes.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Active Tab Panel */}
            <div className="mt-8 max-w-4xl mx-auto bg-slate-900/45 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-extrabold text-white leading-tight">
                    {activeTabData.title}
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base">
                    {activeTabData.desc}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {activeTabData.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
                        <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4 font-mono text-xs text-slate-400">
                  <div className="flex justify-between items-center text-slate-300 font-bold border-b border-slate-800 pb-2">
                    <span>Simulador de Venta ({activeTabData.name})</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  {activeTab === 'despensas' && (
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Yerba Kurupí x 1 ud</span><span>Gs. 14.500</span></div>
                      <div className="flex justify-between"><span>Leche Trébol Entera x 2 ud</span><span>Gs. 13.000</span></div>
                      <div className="flex justify-between"><span>Pan Felipe x 0.5 kg</span><span>Gs. 6.000</span></div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold">
                        <span>Total Venta</span><span>Gs. 33.500</span>
                      </div>
                      <div className="text-emerald-400 text-[10px] mt-1 font-sans font-semibold">✓ Pago registrado en Caja Efectivo</div>
                    </div>
                  )}
                  {activeTab === 'minimercados' && (
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Caja Registradora 02</span><span className="text-emerald-400">Activa</span></div>
                      <div className="flex justify-between"><span>Cajero Asignado</span><span>Néstor R.</span></div>
                      <div className="flex justify-between"><span>Ventas registradas</span><span>64 tickets</span></div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold">
                        <span>Total del Turno</span><span>Gs. 2.140.000</span>
                      </div>
                      <div className="text-emerald-400 text-[10px] mt-1 font-sans font-semibold">✓ Sincronizado en tiempo real con la nube</div>
                    </div>
                  )}
                  {activeTab === 'ferreterías' && (
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Búsqueda: "tornillo"</span><span className="text-slate-500">12 coincidencias</span></div>
                      <div className="flex justify-between"><span>Tornillo Madera 2" (Stock: 180)</span><span>Gs. 350 / ud</span></div>
                      <div className="flex justify-between"><span>Tornillo Madera 3" (Stock: 45)</span><span>Gs. 500 / ud</span></div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold">
                        <span>Buscar Código</span><span>[F-TOR-002]</span>
                      </div>
                      <div className="text-yellow-400 text-[10px] mt-1 font-sans font-semibold">⚠️ Alerta: Clavos de 2" por debajo del mínimo (reponer)</div>
                    </div>
                  )}
                  {activeTab === 'tiendas' && (
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Remera Sport M - Azul</span><span>Gs. 85.000</span></div>
                      <div className="flex justify-between"><span>Short de Jean L - Celeste</span><span>Gs. 120.000</span></div>
                      <div className="flex justify-between"><span>Descuento aplicado (10%)</span><span className="text-emerald-400">- Gs. 20.500</span></div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold">
                        <span>Importe Final</span><span>Gs. 184.500</span>
                      </div>
                      <div className="text-emerald-400 text-[10px] mt-1 font-sans font-semibold">✓ Forma de Pago: Transferencia Bancaria</div>
                    </div>
                  )}
                  {activeTab === 'fiado' && (
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Cliente: Ña María Duarte</span><span className="text-red-400 font-bold">Deudor</span></div>
                      <div className="flex justify-between"><span>Última compra fiada</span><span>Gs. 45.000 (Yerba, Pan)</span></div>
                      <div className="flex justify-between"><span>Abono realizado</span><span>Gs. 20.000 (Ayer)</span></div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold">
                        <span>Saldo Pendiente</span><span className="text-red-400">Gs. 115.000</span>
                      </div>
                      <div className="text-indigo-400 text-[10px] mt-1 font-sans font-semibold">⚡ Botón: Enviar ticket de cobro por WhatsApp</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="funciones" className="py-20 border-t border-slate-900 bg-slate-950/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Lo que hace el POS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Todo lo necesario para vender y controlar tu negocio</h2>
              <p className="text-slate-400">
                Características desarrolladas pensando en la simplicidad y en el uso ágil para tu equipo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {/* Feature 1 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-4V17l8 4m0-13V9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Control de Inventario</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Carga rápida de productos, control por categorías, alertas de stock mínimo y registro automático al vender. No te quedes sin stock de tus productos estrella.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Caja Rápida de Ventas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Interfaz de ventas optimizada para pantallas táctiles, celulares o computadoras. Registro de efectivo, tarjetas, QR o transferencias al instante.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fiados y Clientes</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sistema de cuentas corrientes para clientes frecuentes. Registra fiado, controla deudas consolidadas y manda recordatorios directamente por WhatsApp.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Reportes de Ganancias</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Mira cuáles son tus productos más vendidos, tus ganancias netas reales del mes y analiza gráficos simples que te ayudan a tomar mejores decisiones comerciales.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mobile-First Responsivo</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Funciona perfectamente desde computadoras viejas, notebooks, tablets o celulares. Controla tu negocio estés donde estés: desde tu casa, depósito o la sucursal.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Soporte Humano Integrado</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  No hables con robots. Recibí soporte directo por WhatsApp de parte de nuestro equipo de tecnología para resolver dudas operativas rápidamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="py-20 bg-slate-950/40 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Inversión transparente</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Planes sencillos, sin contratos largos</h2>
              <p className="text-slate-400">
                Elegí el plan ideal para tu negocio. Activación en el mismo día y soporte prioritario incluido.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto items-stretch">
              {/* Plan Básico */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all relative">
                <div>
                  <h3 className="text-xl font-bold text-white">Plan Básico</h3>
                  <p className="text-slate-400 text-xs mt-1">Esencial para empezar a ordenar tu comercio</p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-white">Gs. 200.000</span>
                    <span className="text-sm text-slate-400 font-semibold"> / mes</span>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Control de Stock e Inventario
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Caja rápida de ventas diarias
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Registro de Clientes y Fiados
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Reportes de ventas básicas
                    </li>
                    <li className="flex items-center gap-2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reportes inteligentes avanzados
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block text-center bg-slate-800 hover:bg-slate-750 text-white font-bold py-3.5 rounded-2xl transition-all">
                    Contratar Básico
                  </a>
                </div>
              </div>

              {/* Plan Pro */}
              <div className="bg-slate-900/90 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-400 transition-all relative shadow-2xl shadow-emerald-500/5">
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                  Recomendado
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">Plan Pro</h3>
                  <p className="text-emerald-400/90 text-xs mt-1">Control inteligente, alertas y máxima rentabilidad</p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-white">Gs. 270.000</span>
                    <span className="text-sm text-slate-400 font-semibold"> / mes</span>
                  </div>
                  <ul className="space-y-3.5 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-white">Todo lo del Plan Básico</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Alertas automáticas de Stock Crítico
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Reportes Inteligentes (Ganancias netas)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Soporte Prioritario 1 a 1 por WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Exportación de fiados en 1 clic
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25">
                    Activar Plan Pro
                  </a>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">
              * Los precios no incluyen IVA. Podés dar de baja el servicio cuando quieras sin contratos de permanencia obligatorios.
            </p>
          </div>
        </section>

        {/* Other Services Section (Nueva Sección) */}
        <section id="otros-servicios" className="py-20 border-t border-slate-900 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left text column */}
              <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Más allá del POS</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Necesitás un sistema a medida?</h2>
                <p className="text-slate-300">
                  Como **Arquitecto Frontend & Desarrollador Full Stack Senior**, diseño y desarrollo soluciones de software premium totalmente adaptadas a los requerimientos específicos de tu empresa en Paraguay.
                </p>
                <div className="pt-4 hidden lg:block">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all">
                    Consultar Proyecto a Medida
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right grid column */}
              <div className="lg:col-span-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  {services.map((svc, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl hover:border-indigo-500/30 transition-all flex gap-4 group">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 group-hover:scale-110 transition-transform h-fit shrink-0">
                        {svc.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm sm:text-base">{svc.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{svc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 text-center lg:hidden">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all w-full sm:w-auto">
                    Consultar Proyecto a Medida
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-slate-950/20 border-t border-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Casos de éxito reales</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Comercios paraguayos que ya transformaron su gestión</h2>
              <p className="text-slate-400">
                Escuchá la experiencia de quienes dejaron los cuadernos de papel para automatizar sus negocios con nosotros.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {testimonials.map((test, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    {test.text}
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-850">
                    <img src={test.image} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{test.name}</h4>
                      <p className="text-[10px] text-slate-400">{test.role}</p>
                      <p className="text-[9px] text-emerald-400 font-semibold">{test.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 border-t border-slate-900 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Dudas comunes</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Preguntas Frecuentes</h2>
              <p className="text-slate-400">
                Todo lo que necesitás saber antes de empezar a utilizar nuestro POS comercial.
              </p>
            </div>

            <div className="mt-12 max-w-3xl mx-auto space-y-3.5">
              {faqList.map((faq, index) => (
                <div key={index} className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-white hover:bg-slate-850/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openFaq === index ? 'max-h-60 border-t border-slate-850' : 'max-h-0'
                    }`}
                  >
                    <p className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0c111e]/40">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 md:py-24 border-t border-slate-900 bg-slate-950 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/5 to-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-tr from-slate-900 via-[#10192e] to-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Tomá el control absoluto de tu negocio desde hoy
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
                Registrate y probá la demo online gratis en menos de 1 minuto, o agendá una llamada con nuestro equipo en Paraguay por WhatsApp.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4.5 rounded-2xl shadow-lg transition-all active:scale-95">
                  Probar Demo Gratis Ahora
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center border border-slate-700 bg-slate-950/60 hover:bg-slate-900 text-white font-semibold px-8 py-4.5 rounded-2xl hover:border-slate-600 transition-all">
                  <svg className="w-5 h-5 mr-2 fill-emerald-400" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.518.003 10.01-4.485 10.013-10.004.002-2.673-1.04-5.184-2.937-7.082C16.452 1.621 13.945.575 11.27.575c-5.52 0-10.011 4.49-10.014 10.011-.002 1.91.498 3.774 1.448 5.376L1.724 21.8l6.096-1.597-.173-.049z" />
                  </svg>
                  Hablar con un Asesor
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-500 text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <span className="font-extrabold text-white text-lg">SmartPOS PY</span>
              <p className="text-slate-400">
                El sistema de punto de venta inteligente adaptado al comercio local de Paraguay.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">POS Comercial</h4>
              <ul className="space-y-2">
                <li><a href="#problemas" className="hover:text-emerald-400">Problemas</a></li>
                <li><a href="#beneficios" className="hover:text-emerald-400">Beneficios</a></li>
                <li><a href="#funciones" className="hover:text-emerald-400">Funcionalidades</a></li>
                <li><a href="#precios" className="hover:text-emerald-400">Planes y Precios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Servicios a Medida</h4>
              <ul className="space-y-2">
                <li><a href="#otros-servicios" className="hover:text-emerald-400">Desarrollo Web Full Stack</a></li>
                <li><a href="#otros-servicios" className="hover:text-emerald-400">E-commerce y Portales</a></li>
                <li><a href="#otros-servicios" className="hover:text-emerald-400">Integraciones de Software</a></li>
                <li><a href="#otros-servicios" className="hover:text-emerald-400">Soporte y Consultoría</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Acceso rápido</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-emerald-400">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400">Registrar mi Comercio</Link></li>
                <li><a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400">Soporte por WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
            <p>© {new Date().getFullYear()} SmartPOS Paraguay. Todos los derechos reservados.</p>
            <p>
              Desarrollado con ❤️ para comercios de Paraguay por{' '}
              <a href="#otros-servicios" className="text-white hover:text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-500">
                Frontend Architect & UX Specialist
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
