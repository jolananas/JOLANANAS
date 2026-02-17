import React, { ReactNode } from 'react';
import { CartContext } from '../../src/components/providers/CartProvider';

export const MockCartProvider = ({ children }: { children: ReactNode }) => {
  const mockContext = {
    cart: { id: 'mock-cart-id', lines: { edges: [] }, cost: { totalAmount: { amount: '0' } } },
    cartOpen: false,
    toggleCart: () => console.log('Mock toggleCart'),
    addItem: async () => console.log('Mock addItem'),
    removeItem: async () => console.log('Mock removeItem'),
    loading: false,
    items: [],
    totalPrice: 0,
    totalItems: 0,
    clearCart: () => console.log('Mock clearCart'),
    updateQuantity: () => console.log('Mock updateQuantity'),
  };

  return (
    <CartContext.Provider value={mockContext}>
      {children}
    </CartContext.Provider>
  );
};

export const withCartProvider = (Story: any) => (
  <MockCartProvider>
    <Story />
  </MockCartProvider>
);
