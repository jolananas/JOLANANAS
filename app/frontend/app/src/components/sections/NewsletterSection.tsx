/**
 * 🍍 JOLANANAS - Newsletter Section Hydrogen Style
 * ================================================
 * Section newsletter avec formulaire d'inscription
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setIsSubscribed(true);
      setEmail('');
      toast.success('Inscription réussie ! Vous recevrez bientôt nos dernières créations.');
    } catch (err: any) {
      const errorMessage = err.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium">
      <div className="container mx-auto">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-none bg-transparent text-white">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mx-auto mb-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <Mail className="text-jolananas-gold mr-2 h-4 w-4" />
                Restez informé
              </Badge>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-6">
                Recevez nos dernières créations
              </CardTitle>
              <CardDescription className="text-white/80 text-lg mb-8">
                Inscrivez-vous à notre newsletter et découvrez en exclusivité nos nouvelles créations artisanales, 
                nos offres spéciales et nos conseils d'entretien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubscribed ? (
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        placeholder="Votre adresse email"
                        className="bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border-white/20 focus:ring-jolananas-gold"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-jolananas-gold hover:bg-yellow-400"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          S'inscrire
                        </>
                      )}
                    </Button>
                  </form>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <Alert variant="destructive">
                        <AlertDescription className="text-sm text-center">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-jolananas-gold text-4xl mb-4">✨</div>
                      <CardTitle className="text-white text-xl font-bold mb-2">
                        Merci pour votre inscription !
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Vous recevrez bientôt nos dernières créations par email.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <p className="text-white/60 text-sm mt-6">
                Nous respectons votre vie privée. Désinscription possible à tout moment.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}