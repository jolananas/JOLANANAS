import { Truck } from "lucide-react";

interface StoreAvailabilityProps {
  availability: {
    available: boolean;
    location: {
      name: string;
    };
    pickUpTime: string;
  } | null;
}

export function StoreAvailability({ availability }: StoreAvailabilityProps) {
  if (!availability || !availability.available) return null;

  return (
    <div className="mt-3 bg-secondary/30 p-3 rounded-lg flex items-start gap-3 border border-secondary">
      <Truck className="h-5 w-5 text-primary mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-sm">
          Disponible pour retrait immédiat à {availability.location.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {availability.pickUpTime}
        </p>
      </div>
    </div>
  );
}
