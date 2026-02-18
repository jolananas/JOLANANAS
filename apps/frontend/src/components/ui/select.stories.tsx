import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

/**
 * 🍍 JOLANANAS - Select
 * =====================
 * Menu déroulant permettant à l'utilisateur de choisir une option parmi une liste.
 */
const meta: Meta<typeof Select> = {
  title: "JOLANANAS/UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Choisir un fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits Tropicaux</SelectLabel>
          <SelectItem value="ananas">Ananas 🍍</SelectItem>
          <SelectItem value="mangue">Mangue 🥭</SelectItem>
          <SelectItem value="coco">Coco 🥥</SelectItem>
          <SelectLabel>Autres</SelectLabel>
          <SelectItem value="pomme">Pomme 🍎</SelectItem>
          <SelectItem value="banane">Banane 🍌</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Small: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[150px]" size="sm">
        <SelectValue placeholder="Taille" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="m">Medium</SelectItem>
        <SelectItem value="l">Large</SelectItem>
      </SelectContent>
    </Select>
  ),
};
