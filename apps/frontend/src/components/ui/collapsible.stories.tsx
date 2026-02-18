import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
import { Button } from "./button";
import { ChevronsUpDown } from "lucide-react";

/**
 * 🍍 JOLANANAS - Collapsible
 * ==========================
 * Composant permettant de masquer ou d'afficher du contenu de manière interactive.
 */
const meta: Meta<typeof Collapsible> = {
  title: "JOLANANAS/UI/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          @jolananas a posté une nouvelle collection
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm leading-none bg-white">
        @jolananas/artisanat-v1
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm leading-none bg-white">
          @jolananas/design-system-v2
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm leading-none bg-white">
          @jolananas/marketing-v1
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
