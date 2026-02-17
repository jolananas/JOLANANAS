import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Accept terms and conditions",
    htmlFor: "terms",
  },
  render: (args) => (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label {...args} />
      </div>
  )
};
