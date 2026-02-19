"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Impossible d'envoyer le message. Veuillez réessayer.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Message envoyé !</h3>
        <p className="text-gray-600">
          Merci de nous avoir contactés. Nous reviendrons vers vous très vite.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setStatus("idle")}
          className="mt-6"
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nom
          </label>
          <Input 
            id="name" 
            placeholder="Votre nom" 
            required 
            value={formData.name}
            onChange={handleChange}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Sujet
        </label>
        <Input 
          id="subject" 
          placeholder="À propos de..." 
          required 
          value={formData.subject}
          onChange={handleChange}
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Votre message..."
          className="min-h-[120px]"
          required
          value={formData.message}
          onChange={handleChange}
          disabled={status === "loading"}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        variant="cta"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
