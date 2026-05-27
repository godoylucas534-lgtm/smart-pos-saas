import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  taxRate: number;
  stock: number;
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
  unitPrice: number; // Añadido para compatibilidad con PaymentModal
}

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  taxTotal: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => {
      const calculateTotals = (items: CartItem[]) => {
        let subtotal = 0;
        let taxTotal = 0;
        
        items.forEach(item => {
          const lineSubtotal = item.unitPrice * item.quantity;
          const lineTax = lineSubtotal * (item.product.taxRate / 100);
          subtotal += lineSubtotal;
          taxTotal += lineTax;
        });

        const total = subtotal + taxTotal;
        return { subtotal, taxTotal, total };
      };

      return {
        items: [],
        total: 0,
        subtotal: 0,
        taxTotal: 0,

        addItem: (product: Product) => set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          let newItems;
          if (existing) {
            newItems = state.items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice } : i
            );
          } else {
            newItems = [...state.items, { product, quantity: 1, unitPrice: product.salePrice, lineTotal: product.salePrice }];
          }
          return { items: newItems, ...calculateTotals(newItems) };
        }),

        removeItem: (productId: string) => set((state) => {
          const newItems = state.items.filter((i) => i.product.id !== productId);
          return { items: newItems, ...calculateTotals(newItems) };
        }),

        updateQuantity: (productId: string, quantity: number) => set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.product.id !== productId);
            return { items: newItems, ...calculateTotals(newItems) };
          }
          const newItems = state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity, lineTotal: quantity * i.unitPrice } : i
          );
          return { items: newItems, ...calculateTotals(newItems) };
        }),

        clearCart: () => set({ items: [], total: 0, subtotal: 0, taxTotal: 0 }),
      };
    },
    {
      name: 'pos-cart',
    }
  )
);
