import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { InfoBanner } from "./InfoBanner";
import { MockCartProvider } from "../../../.storybook/decorators/CartProviderDecorator";
import { BannerProvider } from "@/components/layout/BannerContext";
import { BannerMessage } from "@/lib/config/bannerConfig";

// Wrapper pour fournir les contextes nécessaires
const BannerWrapper = (Story: any) => (
  <MockCartProvider>
    <BannerProvider>
      <div className="relative min-h-[150px] w-full transform scale-100">
        <Story />
      </div>
    </BannerProvider>
  </MockCartProvider>
);

const meta: Meta<typeof InfoBanner> = {
  title: "JOLANANAS/Layout/InfoBanner",
  component: InfoBanner,
  decorators: [BannerWrapper],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bandeau d'information global affiché en haut du site. Gère les promotions, alertes et messages contextuels avec le système de design Suisse/Fashion.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfoBanner>;

// 1. Promotion (Rose / Accent)
export const Promotion: Story = {
  args: {
    forceBanner: {
      id: "demo-promo",
      type: "promotion",
      title: "Livraison gratuite dès 50€ d'achat !",
      description: "Profitez de la livraison offerte sur toutes vos commandes",
      link: {
        href: "#",
        label: "Découvrir",
      },
      dismissible: true,
      priority: 1,
      icon: "truck", // Sera mappé sur l'icône Truck si l'ID match ou par défaut
    } as BannerMessage,
  },
};

// 2. Information (Bleu / Slate)
export const Info: Story = {
  args: {
    forceBanner: {
      id: "demo-info",
      type: "info",
      title: "Livraison express disponible",
      description:
        "Recevez votre commande dès demain avec notre service express.",
      dismissible: true,
      priority: 1,
    } as BannerMessage,
  },
};

// 3. Warning (Jaune / Amber)
export const Warning: Story = {
  args: {
    forceBanner: {
      id: "maintenance", // ID spécial pour l'icône Wrench
      type: "warning",
      title: "Maintenance programmée",
      description: "Le site sera temporairement indisponible cette nuit.",
      dismissible: false,
      priority: 10,
    } as BannerMessage,
  },
};

// 4. Success (Vert / Emerald)
export const Success: Story = {
  args: {
    forceBanner: {
      id: "free-shipping-achieved",
      type: "success",
      title: "Livraison gratuite activée !",
      description: "Félicitations, les frais de port sont offerts.",
      link: {
        href: "#",
        label: "Voir le panier",
      },
      dismissible: true,
      priority: 5,
    } as BannerMessage,
  },
};

// 5. Default (Gris / Muted)
export const Default: Story = {
  args: {
    forceBanner: {
      id: "demo-default",
      type: "info", // Fallback visuel
      title: "Message par défaut",
      description: "Ceci est un message d'information standard.",
      dismissible: true,
      priority: 0,
    } as BannerMessage,
  },
};

// 6. Sans Description
export const NoDescription: Story = {
  args: {
    forceBanner: {
      id: "demo-nodesc",
      type: "promotion",
      title: "Juste un titre percutant !",
      link: {
        href: "#",
        label: "Action",
      },
      dismissible: true,
      priority: 1,
    } as BannerMessage,
  },
};

// 7. Bannière Welcome
export const Welcome: Story = {
  args: {
    forceBanner: {
      id: "welcome-discount",
      type: "promotion",
      title: "Bienvenue ! -10% sur votre commande",
      description: "Utilisez le code BIENVENUE10",
      link: {
        href: "#",
        label: "En profiter",
      },
      dismissible: true,
      priority: 2,
    } as BannerMessage,
  },
};
