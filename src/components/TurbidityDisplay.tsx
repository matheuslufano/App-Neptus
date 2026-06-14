"use client";

import { CircleHelp } from "lucide-react";

import { getQualityColor } from "@/utils/turbidity-util";

const TurbidityDisplay = ({ turbidityValue }: { turbidityValue: number }) => {
  const { color, text } = getQualityColor(turbidityValue);
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted border rounded-md relative shadow-lg">
      <h2 className="text-2xl font-semibold">Turbidez: {turbidityValue} NTU</h2>
      <p className="text-lg">
        Qualidade: <span className={color}>{text}</span>
      </p>
      <button
        onClick={() => {}}
        className="absolute top-2 right-2 cursor-pointer"
      >
        <CircleHelp className="text-muted-foreground" size={24} />
      </button>
    </div>
  );
};
export default TurbidityDisplay;
