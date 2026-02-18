"use client";

import { ShoppingBag } from "lucide-react";

export function ReassuranceBlock() {
  return (
    <div className="bg-jolananas-peach-light/10 border-jolananas-peach-light/30 rounded-2xl p-4 flex items-start gap-3">
      <ShoppingBag className="w-5 h-5 text-jolananas-pink-deep mt-1 flex-shrink-0" />
      <p className="text-xs text-gray-600 leading-relaxed">
        Chez <span className="font-bold text-jolananas-pink-deep">Jolananas</span>, chaque pièce est vérifiée manuellement avant expédition pour garantir une qualité irréprochable.
      </p>
    </div>
  );
}
