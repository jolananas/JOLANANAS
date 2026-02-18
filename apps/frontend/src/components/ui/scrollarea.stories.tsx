import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ScrollArea } from "./scrollarea";

/**
 * 🍍 JOLANANAS - ScrollArea
 * =========================
 * Zone de défilement personnalisée avec des barres de défilement stylisées.
 */
const meta: Meta<typeof ScrollArea> = {
  title: "JOLANANAS/UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border bg-white">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none text-primary">Versions</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">
              {tag}
            </div>
            <hr className="my-2 border-gray-100" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border bg-white">
      <div className="flex w-max p-4 space-x-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-40 w-40 rounded-md bg-jolananas-pink-soft/20 flex items-center justify-center text-jolananas-pink-deep">
            Option {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
