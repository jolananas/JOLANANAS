import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ProductFilters } from "./ProductFilters";
import { useState } from "react";

/**
 * 🍍 JOLANANAS - ProductFilters
 * =============================
 * Panneau de filtres latéral pour les collections de produits, 
 * incluant le tri et le filtrage par catégories (tags).
 */
const meta: Meta<typeof ProductFilters> = {
  title: "JOLANANAS/Feature/Product/ProductFilters",
  component: ProductFilters,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductFilters>;

export const Default: Story = {
  render: () => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("featured");

    return (
      <div className="w-[600px] border p-12 bg-gray-50 rounded-xl">
        <ProductFilters
          availableTags={["Bagues", "Bracelets", "Colliers", "Or", "Argent", "Coco"]}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={() => {
            setSelectedTags([]);
            setSortBy("featured");
          }}
        />
        <div className="mt-8">
          <p className="text-sm font-medium">Filtres actifs:</p>
          <pre className="text-xs mt-2 bg-white p-4 rounded border">
            {JSON.stringify({ selectedTags, sortBy }, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};
