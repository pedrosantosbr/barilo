"use client";

import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

type SliderProps = React.ComponentProps<typeof Slider>;

export const SelectRadiusPreference = ({
  className,
  ...props
}: SliderProps) => {
  const [radius, setRadius] = useState([20]);

  return (
    <div className="h-10 w-[500px] flex items-center space-x-4">
      <div className="text-sm">Filtrar por distância:</div>
      <Slider
        value={radius}
        onValueChange={(e) => setRadius(e)}
        defaultValue={[10]}
        max={100}
        step={5}
        className={cn("w-[40%] mr-2", className)}
        {...props}
      />
      <small className="">{radius} km</small>
    </div>
  );
};
