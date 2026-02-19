"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
// Les imports ci-dessous fonctionnent maintenant comme des appels RPC (Remote Procedure Call) grâce au "use server"
import {
  createCart,
  addToCart,
  getCart,
  removeFromCart,
  updateCartLine,
} from "@/lib/shopify";

type CartContextType = {
  cart: any | null;
  cartOpen: boolean;
  toggleCart: () => void;
  addItem: (variantId: string, quantity?: number, sellingPlanId?: string) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  loading: boolean;
  // Legacy Adapter Properties for Checkout
  items: any[];
  totalPrice: number;
  totalItems: number;
  clearCart: () => void;
  updateQuantity: (id: string, qty: number) => void;
};

export const CartContext = createContext<CartContextType>({
  items: [],
  totalPrice: 0,
  totalItems: 0,
  clearCart: () => {},
  updateQuantity: () => {},
  cart: null,
  cartOpen: false,
  toggleCart: () => {},
  addItem: async () => {},
  removeItem: async () => {},
  loading: false,
} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initCart = async () => {
      const localCartId = localStorage.getItem("jolananas_cart_id");
      if (localCartId) {
        const existingCart = await getCart(localCartId);
        if (existingCart) {
          setCart(existingCart);
          return;
        }
      }
      // Si pas de panier ou expiré
      const newCart = await createCart();
      if (newCart) {
        localStorage.setItem("jolananas_cart_id", newCart.id);
        setCart(newCart);
      }
    };
    initCart();
  }, []);

  const toggleCart = () => setCartOpen(!cartOpen);

  const addItem = async (variantId: string, quantity: number = 1, sellingPlanId?: string) => {
    setLoading(true);
    setCartOpen(true);
    try {
      let currentCartId = cart?.id;
      if (!currentCartId) {
        const newCart = await createCart();
        currentCartId = newCart.id;
        localStorage.setItem("jolananas_cart_id", currentCartId);
      }
      const updatedCart = await addToCart(currentCartId, [
        { merchandiseId: variantId, quantity, sellingPlanId },
      ]);
      setCart(updatedCart);
    } catch (e) {
      console.error("Erreur ajout panier", e);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (lineId: string) => {
    setLoading(true);
    try {
      const updatedCart = await removeFromCart(cart.id, [lineId]);
      setCart(updatedCart);
    } catch (e) {
      console.error("Erreur suppression", e);
    } finally {
      setLoading(false);
    }
  };

  // Adapter methods
  const items = useMemo(() => {
    if (!cart?.lines?.edges) return [];
    return cart.lines.edges.map((edge: any) => ({
      id: edge.node.id, // This is the Line ID
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
      title: edge.node.merchandise.product.title,
      price: edge.node.cost?.totalAmount?.amount 
        ? parseFloat(edge.node.cost.totalAmount.amount) / edge.node.quantity
        : parseFloat(edge.node.merchandise.price?.amount || "0"), // Accurate unit price with fallback
      image: edge.node.merchandise.product.featuredImage?.url,
      handle: edge.node.merchandise.product.handle,
      productTitle: edge.node.merchandise.product.title,
      sellingPlan: edge.node.sellingPlanAllocation?.sellingPlan,
    }));
  }, [cart]);

  const totalPrice = parseFloat(cart?.cost?.totalAmount?.amount);
  const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const clearCart = () => {
    // Not really possible to 'clear' easy without removing all lines, maybe create new cart
    localStorage.removeItem("jolananas_cart_id");
    setCart(null);
    window.location.reload(); // Brute force clear for now
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity === 0) {
      await removeItem(lineId);
      return;
    }
    setLoading(true);
    try {
      const updatedCart = await updateCartLine(cart.id, lineId, quantity);
      setCart(updatedCart);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        toggleCart,
        addItem,
        removeItem,
        loading,
        items,
        totalPrice,
        totalItems,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
