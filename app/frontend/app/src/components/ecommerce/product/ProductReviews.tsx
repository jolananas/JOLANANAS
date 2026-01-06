/**
 * 🍍 JOLANANAS - Product Reviews Component
 * ========================================
 * Système d'avis clients pour les produits
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Note: Pour l'instant, affiche un état vide avec microcopy car aucune API d'avis n'est configurée
 */

'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/Empty';
import { LoadingDots } from '@/components/ui/LoadingDots';
import type { ProductReview, ReviewStats, BaseEcommerceProps } from '@/app/src/types/ecommerce';

interface ProductReviewsProps extends BaseEcommerceProps {
  productId: string;
  productTitle: string;
}

export function ProductReviews({ productId, productTitle, className }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    userName: '',
  });

  // Pour l'instant, afficher un état vide avec microcopy
  // Dans le futur, on pourrait intégrer une API d'avis ou utiliser Prisma

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implémenter l'API d'avis
      // await fetch('/api/products/reviews', { method: 'POST', body: JSON.stringify({ ... }) });
      
      // Pour l'instant, juste afficher un message
      alert('Fonctionnalité d\'avis en cours de développement. Merci de votre intérêt !');
      setShowForm(false);
      setFormData({ rating: 5, title: '', comment: '', userName: '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`product-reviews ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Avis clients</CardTitle>
              {stats ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(stats.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {stats.averageRating.toFixed(1)} ({stats.totalReviews} avis)
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Soyez le premier à laisser un avis sur ce produit
                </p>
              )}
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Laisser un avis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire d'avis */}
          {showForm && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Partagez votre avis</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note</label>
                    <Select
                      value={formData.rating.toString()}
                      onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value, 10) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} étoile{rating > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="userName" className="text-sm font-medium">
                      Votre nom
                    </label>
                    <input
                      id="userName"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reviewTitle" className="text-sm font-medium">
                      Titre de l'avis <span className="text-muted-foreground text-xs">(optionnel)</span>
                    </label>
                    <input
                      id="reviewTitle"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Résumez votre expérience"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reviewComment" className="text-sm font-medium">
                      Votre avis <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      id="reviewComment"
                      placeholder="Partagez votre expérience avec ce produit..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting || !formData.comment.trim()}>
                      {isSubmitting ? <>Envoi en cours <LoadingDots size="sm" /></> : 'Publier mon avis'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Liste des avis */}
          {reviews.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>Aucun avis pour le moment</EmptyTitle>
                <EmptyDescription>
                  Soyez le premier à partager votre expérience avec ce produit. Votre avis aide les autres clients à faire leur choix.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setShowForm(true)}>
                  Laisser le premier avis
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{review.userName}</span>
                        {review.verifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            Achat vérifié
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                      {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{review.helpfulCount} personne{review.helpfulCount > 1 ? 's' : ''} ont trouvé cet avis utile</span>
                        </div>
                      )}
                    </div>
                    {review.response && (
                      <div className="mt-3 pt-3 border-t bg-muted/50 p-3 rounded">
                        <p className="text-xs font-semibold mb-1">Réponse du vendeur</p>
                        <p className="text-sm text-muted-foreground">{review.response.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

