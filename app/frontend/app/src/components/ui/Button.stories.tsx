/**
 * 🍍 JOLANANAS - Stories Button
 * =============================
 * Stories Storybook pour le composant Button
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/components/ui/Button';
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'JOLANANAS/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant Button personnalisé avec les couleurs signature JOLANANAS et diverses variantes pour tous les besoins d\'interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
      description: 'Variante stylistique du bouton',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Taille du bouton',
    },
    animation: {
      control: { type: 'select' },
      options: ['none', 'bounce', 'pulse', 'wiggle'],
      description: 'Animation au hover',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'État de chargement avec spinner',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Désactiver le bouton',
    },
    asChild: {
      control: { type: 'boolean' },
      description: 'Rendu en tant qu\'enfant Slot (pour liens)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Stories principales
export const Primary: Story = {
  args: {
    children: 'Bouton Principal',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Bouton Secondaire',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Bouton Outline',
    variant: 'outline',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Bouton Ghost',
    variant: 'ghost',
    size: 'md',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Supprimer',
    variant: 'destructive',
    size: 'md',
  },
};

export const Link: Story = {
  args: {
    children: 'En savoir plus',
    variant: 'link',
    size: 'md',
  },
};

// Stories avec icônes
export const WithLeftIcon: Story = {
  args: {
    children: 'Ajouter au panier',
    variant: 'primary',
    size: 'md',
    leftIcon: <ShoppingBag className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Découvrir',
    variant: 'outline',
    size: 'lg',
    rightIcon: <ArrowRight className="h-5 w-5" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Favoris',
    variant: 'secondary',
    size: 'md',
    leftIcon: <Heart className="h-4 w-4" />,
    rightIcon: <Star className="h-4 w-4" />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Chargement...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

// Stories tailles
export const Small: Story = {
  args: {
    children: 'Petit',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    variant: 'primary',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Très Large',
    variant: 'primary',
    size: 'xl',
  },
};

// Stories animations
export const WithBounce: Story = {
  args: {
    children: 'Bounce',
    variant: 'primary',
    size: 'md',
    animation: 'bounce',
  },
};

export const WithPulse: Story = {
  args: {
    children: 'Pulse',
    variant: 'secondary',
    size: 'md',
    animation: 'pulse',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Désactivé',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

// Story de présentation avec toutes les variantes
export const AllVariants: Story = {
  render: () => (
    <div className="bg-gradient-to-br from-jolananas-gray-warm to-jolananas-white-soft p-8 rounded-lg">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-jolananas-black-ink mb-4">
          Toutes les Variantes du Button JOLANANAS
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="primary">Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        
        <h4 className="text-lg font-semibold text-jolananas-black-ink mt-6">
          Avec Icônes
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="primary" leftIcon={<ShoppingBag className="h-4 w-4" />}>
            Ajouter au panier
          </Button>
          <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Découvrir plus
          </Button>
        </div>
        
        <h4 className="text-lg font-semibold text-jolananas-black-ink mt-6">
          États Spéciaux
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button loading>Chargement...</Button>
          <Button disabled>Désactivé</Button>
          <Button animation="bounce">Animation</Button>
        </div>
      </div>
    </div>
  ),
};
