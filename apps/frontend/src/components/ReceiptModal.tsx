import { useRef } from 'react';
import toast from 'react-hot-toast';

interface ReceiptItem {
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxRate?: number;
}

interface ReceiptData {
  id: string;
  receiptNumber: string;
  createdAt: string;
  paymentMethod: string;
  items: ReceiptItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  changeAmount: number;
  customer?: any;
  cashier?: any;
}

interface Props {
  sale: ReceiptData;
  store: {
    name: string;
    address?: string;
    phone?: string;
    taxId?: string;
    email?: string;
    currency?: string;
    settings?: { receiptFooter?: string };
  };
  onClose: () => void;
}

export default function ReceiptModal({ sale, store, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const currency = store.currency || 'PYG';
  const format = (n: number) =>
    new Intl.NumberFormat('es-PY', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(n || 0));

  const tax5 = sale.items?.filter((i) => Number(i.taxRate) === 5).reduce((a, b) => a + Number(b.lineTotal || 0), 0) || 0;
  const tax10 = sale.items?.filter((i) => Number(i.taxRate) === 10).reduce((a, b) => a + Number(b.lineTotal || 0), 0) || 0;
  const exentas = sale.items?.filter((i) => Number(i.taxRate) === 0).reduce((a, b) => a + Number(b.lineTotal || 0), 0) || 0;

  const paymentLabel = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Fiado',
  }[sale.paymentMethod] || sale.paymentMethod;

  const customerBlock = (() => {
    if (!sale.customer) return { line1: 'CLIENTE: Consumidor Final', line2: '' };
    if (sale.customer.taxDocument) return { line1: `CLIENTE: ${sale.customer.businessName || `${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim()}`, line2: `RUC: ${sale.customer.taxDocument}` };
    if (sale.customer.document) return { line1: `CLIENTE: ${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim(), line2: `C.I.: ${sale.customer.document}` };
    return { line1: `CLIENTE: ${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim(), line2: '' };
  })();

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const popup = window.open('', '_blank', 'width=420,height=800');
    if (!popup) {
      toast.error('Permite popups para imprimir');
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Recibo #${sale.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 4mm; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
          </style>
        </head>
        <body>${content.innerHTML}<script>window.onload=()=>{window.print();window.close();}</script></body>
      </html>
    `);
    popup.document.close();
  };

  const handleDownloadPdf = () => handlePrint();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex gap-2 p-4 border-b">
          <button onClick={handlePrint} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold">Imprimir {'\u{1F5A8}\uFE0F'}</button>
          <button onClick={handleDownloadPdf} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold">Descargar PDF {'\u{1F4C4}'}</button>
          <button onClick={onClose} className="px-3 bg-gray-200 rounded-lg">Cerrar</button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh] text-black" style={{ fontFamily: 'Courier New, monospace', fontSize: 12 }}>
          <div ref={printRef}>
            <div className="center" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{store.name || 'TIENDA'}</div>
              {store.address && <div>{store.address}</div>}
              {store.phone && <div>Tel: {store.phone}</div>}
              {store.taxId && <div>RUC/NIT: {store.taxId}</div>}
              {store.email && <div>{store.email}</div>}
            </div>

            <div className="divider" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Comprobante:</span><strong>#{sale.receiptNumber}</strong></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Fecha/Hora:</span><span>{new Date(sale.createdAt).toLocaleString('es-PY')}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tipo:</span><span>TICKET DE VENTA</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cajero:</span><span>{sale.cashier?.firstName || ''} {sale.cashier?.lastName || ''}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Caja/Turno:</span><span>Principal</span></div>

            <div style={{ marginTop: 6 }}>{customerBlock.line1}</div>
            {customerBlock.line2 && <div>{customerBlock.line2}</div>}

            <div className="divider" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            <div style={{ fontWeight: 'bold' }}>Cant.  Descripcion               P.Unit      Total</div>
            {sale.items?.map((it, idx) => (
              <div key={idx} style={{ marginTop: 4 }}>
                <div>{Number(it.quantity).toFixed(3)}  {it.productName}</div>
                {it.productSku && <div style={{ fontSize: 11 }}>SKU: {it.productSku}</div>}
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{format(Number(it.unitPrice))}</span>
                  <span>{format(Number(it.lineTotal))}</span>
                </div>
              </div>
            ))}

            <div className="divider" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal (sin IVA):</span><span>{format(Number(sale.subtotal))}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA 5%:</span><span>{format(tax5)}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA 10%:</span><span>{format(tax10)}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Exentas:</span><span>{format(exentas)}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}><span>TOTAL A PAGAR:</span><span>{format(Number(sale.total))}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Monto recibido:</span><span>{format(Number(sale.amountPaid))}</span></div>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vuelto/Cambio:</span><span>{format(Number(sale.changeAmount))}</span></div>

            <div style={{ marginTop: 6 }}>Forma de pago: {paymentLabel}</div>

            <div className="divider" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            <div style={{ textAlign: 'center' }}>{store.settings?.receiptFooter || 'Gracias por su compra'}</div>
            <div style={{ textAlign: 'center' }}>Conserve este comprobante</div>
            <div style={{ textAlign: 'center', fontSize: 10, marginTop: 4 }}>QR: #{sale.receiptNumber}</div>
            <div style={{ borderTop: '1px dashed #000', marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
