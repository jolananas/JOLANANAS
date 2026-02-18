import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { AspectRatio } from "./aspectratio";

/**
 * 🍍 JOLANANAS - AspectRatio
 * ==========================
 * Maintient un ratio d'aspect spécifique pour son contenu (ex: 16/9, 4/3, 1/1).
 */
const meta: Meta<typeof AspectRatio> = {
  title: "JOLANANAS/UI/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const SixteenNine: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="rounded-md object-cover size-full"
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1 / 1} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="rounded-md object-cover size-full"
        />
      </AspectRatio>
    </div>
  ),
};
