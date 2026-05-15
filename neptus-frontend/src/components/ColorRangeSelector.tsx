"use client";

import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColorRangeItem {
  id: number;
  color?: string;
  label: string;
  description: string;
  imageUrl?: string;
}

interface ColorRangeSelectorProps {
  value?: number;
  onChange: (value: number, colorData: ColorRangeItem) => void;
  className?: string;
}

export const colorRangeData: ColorRangeItem[] = [
  {
    // color: "#B3E5FC",
    id: 1,
    imageUrl: "/images/tanque-transparente-claro.jpg",
    label: "Cristalina",
    description: "Água limpa, baixa turbidez",
  },
  {
    id: 2,
    // color: "#A5D6A7",
    imageUrl: "/images/tanque-transparente-escuro.jpg",
    label: "Clara",
    description: "Fitoplâncton leve, condição boa",
  },
  {
    id: 3,
    // color: "#66BB6A",
    imageUrl: "/images/tanque-amarelo-claro.jpg",
    label: "Ligeiramente turva",
    description: "Fitoplâncton equilibrado, condição ideal",
  },
  {
    id: 4,
    // color: "#558B2F",
    imageUrl: "/images/tanque-amarelo-escuro.jpg",
    label: "Turva",
    description: "Fitoplâncton em excesso, contém matéria orgânica",
  },
  {
    id: 5,
    // color: "#8D6E63",
    imageUrl: "/images/tanque-verde-claro.jpg",
    label: "Muito turva",
    description: "Alerta, presença de sedimentos orgânicos",
  },
  {
    id: 6,
    // color: "#5D4037",
    imageUrl: "/images/tanque-verde-escuro.jpg",
    label: "Escura",
    description: "Risco elevado, pouca penetração de luz",
  },
  // {
  //   // color: "#9E9E9E",
  //   imageUrl: "/images/tanque1.jpg",
  //   label: "Acinzentada",
  //   description: "Contém resíduos minerais, pode afetar a fauna",
  // },
  // {
  //   // color: "#212121",
  //   imageUrl: "/images/tanque1.jpg",
  //   label: "Opaca",
  //   description: "Crítico, alta concentração de poluentes",
  // },
];

const ColorRangeSelector = ({
  value = 0,
  onChange,
  className,
}: ColorRangeSelectorProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleColorSelect = (index: number) => {
    onChange(index, colorRangeData[index]);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Selecione a cor mais próxima da água
        </label>

        <TooltipProvider>
          <div className="flex gap-1 rounded-lg">
            {colorRangeData.map((item, index) => (
              <Tooltip key={index} open={focusedIndex === index}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleColorSelect(index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    tabIndex={-1}
                    className={`
                      flex-1 h-12 rounded-md border-2 transition-all duration-200 focus:outline-none 
                      ${
                        value === index
                          ? "border-primary scale-105"
                          : "border-muted-foreground/30"
                      }
                    `}
                    // style={{ backgroundColor: item.color }}
                    style={{
                      backgroundImage: item.imageUrl
                        ? `url(${item.imageUrl})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-label={`${item.label}: ${item.description}`}
                  />
                </TooltipTrigger>
                {/* <TooltipContent className="bg-foreground [&>span>svg]:bg-foreground [&>span>svg]:fill-foreground">
                  <div className="flex flex-col">
                    <div className="font-semibold text-background">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </TooltipContent> */}
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* {value >= 0 && value < colorRangeData.length && (
          <div className="text-sm text-muted-foreground">
            Selecionado:{" "}
            <span className="font-medium">{colorRangeData[value].label}</span>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ColorRangeSelector;
