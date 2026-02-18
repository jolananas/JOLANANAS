import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Navigation } from "./Navigation";
import { BannerProvider } from "./BannerContext";
import { NavbarProvider } from "./NavbarContext";
import { MockCartProvider } from "../../../.storybook/decorators/CartProviderDecorator";

/**
 * 🍍 JOLANANAS - Navigation
 * =========================
 * Barre de navigation principale (Navbar) avec menu mobile, logo et accès au panier.
 */
const NavigationWrapper = (Story: any) => (
  <MockCartProvider>
    <BannerProvider>
      <NavbarProvider>
        <div className="min-h-[400px] w-full bg-gray-50">
          <Story />
          <div className="p-20 mt-40 border-t border-dashed text-center text-muted-foreground">
            Espace pour simuler le défilement et le contenu de la page
          </div>
          {/* Footer dummy to trigger intersection observer if needed */}
          <div id="footer" className="h-20 bg-gray-200 mt-96">Footer Simulation</div>
        </div>
      </NavbarProvider>
    </BannerProvider>
  </MockCartProvider>
);

const meta: Meta<typeof Navigation> = {
  title: "JOLANANAS/Layout/Navigation",
  component: Navigation,
  decorators: [NavigationWrapper],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Default: Story = {};

export const MobileOpen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
