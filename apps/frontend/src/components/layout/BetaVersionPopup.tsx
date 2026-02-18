"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { siInstagram } from "simple-icons";
import Image from "next/image";

const STORAGE_KEY = "jolananas-beta-ack";

export function BetaVersionPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
               <Image
                 src="/assets/images/logo/logo-jolananas-gradient.png"
                 alt="Jolananas"
                 width={20}
                 height={20}
                 className="h-5 w-auto"
               />
            </div>
            <DialogTitle>Bienvenue dans l'atelier !</DialogTitle>
          </div>
          <DialogDescription className="text-base text-primary/80">
            Notre boutique est actuellement en <span className="font-semibold text-primary">pré-sortie</span>. 
            Des petits bugs passagers pourraient se présenter pendant que nous peaufinons les derniers détails.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-4 text-sm text-primary">
          <svg
            role="img"
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>{siInstagram.title}</title>
            <path d={siInstagram.path} />
          </svg>
          <p className="text-secondary font-medium">
            Un pépin ? Dites-le nous sur <span className="font-bold text-primary">@jolananas.officiel</span>
          </p>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" onClick={handleClose}>
            C'est noté
          </Button>
          <Button
            variant="link"
            onClick={() => window.open("https://www.instagram.com/jolananas.officiel", "_blank")}
            className="border border-primary text-primary hover:underline rounded-2xl"
          >
            Voir Instagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
