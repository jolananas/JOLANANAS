"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { useCart } from "@/components/providers/CartProvider";

interface CartItemProps {
  item: {
    id: string;
    handle: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
  };
  variant?: "default" | "compact";
}

export function CartItem({ item, variant = "default" }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { formatPrice } = useCurrency();
  const [inputValue, setInputValue] = useState(item.quantity.toString());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const handleQuantityChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setInputValue(numericValue);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    const numeric = parseInt(numericValue, 10);
    if (!isNaN(numeric) && numeric >= 1) {
      debounceTimeout.current = setTimeout(() => {
        updateQuantity(item.id, Math.min(numeric, 999));
      }, 500);
    }
  };

  const handleBlur = () => {
    const numeric = parseInt(inputValue, 10);
    if (isNaN(numeric) || numeric < 1) {
      setInputValue(item.quantity.toString());
    } else {
      updateQuantity(item.id, Math.min(numeric, 999));
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-4 py-4">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
          <Image
            src={item.image || "/assets/images/collections/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-start gap-2">
            <Link href={`/products/${item.handle}`} className="group flex-1">
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-jolananas-pink-deep transition-colors line-clamp-2">
                {item.title}
              </h3>
            </Link>
            <p className="font-bold text-sm text-gray-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-white"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <input
                type="text"
                className="w-8 text-center bg-transparent border-0 focus:ring-0 text-xs font-bold p-0"
                value={inputValue}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={handleBlur}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-white"
                onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-4 md:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        <Image
          src={item.image || "/assets/images/collections/placeholder.svg"}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link href={`/products/${item.handle}`} className="group">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-jolananas-pink-deep transition-colors line-clamp-1">
                {item.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">Édition Artisanale Jolananas</p>
          </div>
          <p className="font-bold text-lg text-gray-900 shrink-0">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white"
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <input
              type="text"
              className="w-10 text-center bg-transparent border-0 focus:ring-0 text-sm font-semibold"
              value={inputValue}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={handleBlur}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white"
              onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center gap-2 px-3 rounded-full"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
