"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmptyCartProps {
  onBrowse?: () => void;
  fullPage?: boolean;
}

export function EmptyCart({ onBrowse, fullPage = false }: EmptyCartProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto h-full ${fullPage ? 'py-20 md:py-32' : 'p-8'}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1 
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-jolananas-pink-medium/20 blur-3xl rounded-full scale-150" />
        <div className="relative bg-white dark:bg-zinc-900 h-24 w-24 rounded-2xl flex items-center justify-center shadow-xl border border-jolananas-pink-light/30">
          <ShoppingBag className="h-10 w-10 text-jolananas-pink-medium" strokeWidth={1.5} />
        </div>
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5] 
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute -top-1 -right-1 h-4 w-4 bg-jolananas-pink-medium rounded-full border-2 border-white dark:border-zinc-900"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Votre panier est vide
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
          Votre panier attend sa première pièce de collection. Une touche de fantaisie ?
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          asChild
          onClick={onBrowse}
          className="h-12 px-8 bg-jolananas-pink-medium hover:bg-jolananas-pink-deep text-white shadow-glow-pink transition-all duration-300 rounded-full font-semibold"
        >
          <Link href="/collections">
            DÉCOUVRIR LES NOUVEAUTÉS
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
