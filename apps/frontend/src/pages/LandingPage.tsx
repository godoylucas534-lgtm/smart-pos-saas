import { Link } from 'react-router-dom';

const whatsappUrl = 'https://wa.me/595981000000?text=Hola%2C%20quiero%20ver%20como%20funciona%20el%20POS%20inteligente%20para%20mi%20negocio.';

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
    name: 'Emprende',
    price: 'Gs. 99.000/mes',
    detail: 'Caja, ventas y stock basico',
  },
  {
    name: 'Negocio Inteligente',
    price: 'Gs. 179.000/mes',
    detail: 'Incluye fiado, reportes e inteligencia operativa',
    recommended: true,
  },
  {
    name: 'Anual',
    price: 'Gs. 1.790.000/año',
    detail: 'Ahorras 2 meses y mantienes todo incluido',
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <p className="font-bold tracking-wide">POS Inteligente PY</p>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white">Ingresar</Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm">
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-12">
          <p className="text-emerald-300 font-medium">No es solo un POS</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 leading-tight">
            Tu sistema te ayuda a decidir mejor cada dia
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl text-lg">
            Controla stock, caja y fiado en un solo lugar. Recibe avisos simples para evitar perdidas y saber que pasa en tu negocio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#demo" className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-5 py-3 rounded-lg">Ver demo online</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-lg">Hablar por WhatsApp</a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Beneficios para tu negocio</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-300 mt-2">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold">Tu negocio te avisa que necesita</h2>
            <p className="text-slate-300 mt-3 max-w-3xl">
              Recibe alertas claras para actuar a tiempo. Menos improvisacion, mas control diario.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-6">
              {smartAlerts.map((item) => (
                <p key={item} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Precios simples en guaranies</h2>
          <p className="text-slate-300 mt-2">Sin contrato largo. Soporte por WhatsApp incluido.</p>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {plans.map((plan) => (
              <article key={plan.name} className={`rounded-xl p-5 border ${plan.recommended ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'}`}>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-3">{plan.price}</p>
                <p className="text-sm text-slate-300 mt-2">{plan.detail}</p>
                {plan.recommended ? <p className="text-xs text-emerald-300 mt-3">Recomendado para despensas y tiendas con fiado</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-4 py-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold">Demo online en minutos</h2>
            <p className="text-slate-300 mt-3">Mira como funciona y como te ayuda a controlar stock, fiado y caja sin complicaciones.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold px-5 py-3 rounded-lg">
                Probar demo ahora
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-lg">
                Agendar demo por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-3">
            {faq.map((item) => (
              <article key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-sm text-slate-300 mt-2">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="bg-cyan-400 text-slate-950 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold">Sabe que pasa en tu negocio, sin adivinar</h2>
            <p className="mt-2 font-medium">Escribinos y te mostramos como empezar rapido.</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 bg-slate-950 text-white font-semibold px-5 py-3 rounded-lg">
              Empezar hoy por WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
