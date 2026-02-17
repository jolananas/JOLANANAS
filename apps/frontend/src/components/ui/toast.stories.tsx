import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./toaster";
import { useToast } from "@/hooks/UseToast";
import { Button } from "./button";
import { ToastAction } from "./toast";

const ToastDemo = () => {
    const { toast } = useToast()
  
    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
            variant="outline"
            onClick={() => {
                toast({
                    title: "Scheduled: Catch up ",
                    description: "Friday, February 10, 2023 at 5:57 PM",
                    action: (
                    <ToastAction altText="Goto schedule">Undo</ToastAction>
                    ),
                })
            }}
        >
            Add to calendar
        </Button>

        <Button
            variant="destructive"
            onClick={() => {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                })
            }}
        >
            Show Destructive Toast
        </Button>
      </div>
    )
}

const meta: Meta<typeof Toaster> = {
  title: "UI/Toast",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[300px] w-full flex items-center justify-center bg-background border rounded-md">
        <Story />
        <Toaster />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => <ToastDemo />,
};
