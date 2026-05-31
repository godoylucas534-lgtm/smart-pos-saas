import { Link } from 'react-router-dom';

const whatsappUrl = 'https://wa.me/595971264523?text=Hola%2C%20quiero%20informacion%20del%20POS%20para%20mi%20negocio.';

const benefits = [
  {
    title: 'Control de stock sin sorpresas',
    description: 'Sabe que falta antes de perder una venta.',
  },
  {
    title: 'Caja clara todos los dias',
    description: 'Ve entradas y salidas para cerrar con tranquilidad.',
  },
  {
    title: 'Fiado ordenado por cliente',
    description: 'Controla deuda pendiente y cobra a tiempo.',
  },
  {
    title: 'Reportes simples',
    description: 'Entiende rapido que se vende y donde ajustar.',
  },
  {
    title: 'Facil de usar',
    description: 'Tu equipo aprende rapido, sin vueltas.',
  },
];

const smartAlerts = [
  'Alertas de stock bajo para reponer a tiempo',
  'Clientes con deuda pendiente para cobrar mejor',
  'Ventas de hoy vs ayer para saber como vas',
  'Producto mas vendido del dia',
  'Aviso si la caja lleva muchas horas abierta',
  'Recomendaciones simples para ordenar el negocio',
];

const plans = [
  {
    name: 'Basico',
    price: 'Gs. 200.000 / mes',
    detail: 'Caja, ventas, stock y fiado en orden',
  },
  {
    name: 'Pro',
    price: 'Gs. 270.000 / mes',
    detail: 'Todo Basico + inteligencia operativa y soporte prioritario',
    recommended: true,
  },
];

const faq = [
  {
    q: 'Esto me ayuda aunque no sea experto en tecnologia?',
    a: 'Si. El sistema esta pensado para dueños de negocio. Te muestra todo en simple y con avisos claros.',
  },
  {
    q: 'Como me ayuda a evitar perdidas?',
    a: 'Te avisa cuando falta stock, cuando hay deudas por cobrar y cuando la caja necesita revision.',
  },
  {
    q: 'Puedo controlar fiado por cliente?',
    a: 'Si. Ves quien debe, cuanto debe y desde cuando.',
  },
  {
    q: 'Que veo en la parte inteligente?',
    a: 'Ves alertas e insights utiles: hoy vs ayer, producto mas vendido y recomendaciones accionables.',
  },
  {
    q: 'Tienen soporte por WhatsApp?',
    a: 'Si. Te acompañamos por WhatsApp para implementacion y dudas del dia a dia.',
  },
  {
    q: 'Puedo ver demo antes de decidir?',
    a: 'Si. Puedes probar la demo online y tambien agendar una demo guiada.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(160deg,#f7f8f4_0%,#eef4ef_45%,#f5f7fa_100%)]">
      <header className="border-b border-slate-200/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <p className="font-black tracking-tight text-xl">POS Inteligente PY</p>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 font-semibold">Ingresar</Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-12">
          <p className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 text-sm border border-emerald-200">No es solo un POS</p>
          <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight tracking-tight max-w-4xl">
            Tu sistema te ayuda a decidir mejor cada dia
          </h1>
          <p className="text-slate-700 mt-5 max-w-2xl text-lg">
            Controla stock, caja y fiado en un solo lugar. Recibe avisos simples para evitar perdidas y saber que pasa en tu negocio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#demo" className="bg-slate-900 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-lg">Ver demo online</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 rounded-lg font-semibold">Hablar por WhatsApp</a>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Hoy vs ayer</p>
              <p className="font-bold mt-1">Ve si subio o bajo tu venta</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Stock</p>
              <p className="font-bold mt-1">Aviso antes de quedarte sin producto</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Fiado</p>
              <p className="font-bold mt-1">Clientes con deuda pendiente al dia</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-3xl font-black tracking-tight">Beneficios para tu negocio</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(2,6,23,0.3)]">
            <h2 className="text-3xl font-black tracking-tight">Tu negocio te avisa que necesita</h2>
            <p className="text-slate-200 mt-3 max-w-3xl">
              Recibe alertas claras para actuar a tiempo. Menos improvisacion, mas control diario.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-6">
              {smartAlerts.map((item) => (
                <p key={item} className="bg-white/5 border border-white/15 rounded-xl p-3 text-sm">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-3xl font-black tracking-tight">Precios claros</h2>
          <p className="text-slate-700 mt-2">Sin contrato largo. Soporte por WhatsApp incluido.</p>
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {plans.map((plan) => (
              <article key={plan.name} className={`rounded-2xl p-6 border ${plan.recommended ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-black mt-3 tracking-tight">{plan.price}</p>
                <p className="text-sm text-slate-700 mt-2">{plan.detail}</p>
                {plan.recommended ? <p className="text-xs text-emerald-700 mt-3 font-semibold">Recomendado para despensas, ferreterias y tiendas con fiado</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-4 py-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <h2 className="text-3xl font-black tracking-tight">Demo online en minutos</h2>
            <p className="text-slate-700 mt-3">Mira como funciona y como te ayuda a controlar stock, fiado y caja sin complicaciones.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="bg-slate-900 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-lg">
                Probar demo ahora
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 rounded-lg font-semibold">
                Agendar demo por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-3xl font-black tracking-tight">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-3">
            {faq.map((item) => (
              <article key={item.q} className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold">{item.q}</h3>
                <p className="text-sm text-slate-700 mt-2">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_60%,#111827_100%)] text-white rounded-3xl p-6 md:p-8">
            <h2 className="text-3xl font-black tracking-tight">Sabe que pasa en tu negocio, sin adivinar</h2>
            <p className="mt-2 text-slate-200 font-medium">Escribinos y te mostramos como empezar rapido.</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-lg">
              Empezar hoy por WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
