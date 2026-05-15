"use client";

import { Clock, Edit } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useTanks } from "@/hooks/useTanks";
import { getQualityColor } from "@/utils/turbidity-util";

import AppButton from "./AppButton";
import Box from "./Box";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface HistoryItemProps {
  id: string;
  time: string;
  date: string;
  tankName: string;
  turbidity: number;
  temperature: number;
  quality: "Bom" | "Regular" | "Ruim";
  oxygen: number;
  ph: number;
  ammonia: number;
  waterColor: number;
  onEdit?: (id: string) => void;
}

const imageTanksList = [
  "/images/tanque-transparente-claro.jpg",
  "/images/tanque-transparente-escuro.jpg",
  "/images/tanque-amarelo-claro.jpg",
  "/images/tanque-amarelo-escuro.jpg",
  "/images/tanque-verde-claro.jpg",
  "/images/tanque-verde-escuro.jpg",
];

const HistoryItem = ({
  id,
  time,
  date,
  tankName,
  turbidity,
  temperature,
  quality,
  oxygen,
  ph,
  ammonia,
  waterColor,
  onEdit,
}: HistoryItemProps) => {
  const { color, text } = getQualityColor(turbidity);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTankModalOpen, setIsTankModalOpen] = useState(false);
  const { tanks } = useTanks();

  // Encontrar informações do tanque
  const tankInfo = tanks.find((tank) => tank.name === tankName);

  return (
    <Box>
      <div className="flex items-center">
        <div className="flex gap-2 flex-1 items-center">
          <Clock size={18} />
          <p className="text-sm">
            {time} - {date}
          </p>
        </div>
        <AppButton size="sm" variant="outline" onClick={() => onEdit?.(id)}>
          <Edit />
        </AppButton>
      </div>

      <p
        className="font-bold mb-2 underline cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => setIsTankModalOpen(true)}
        title="Clique para ver informações do tanque"
      >
        {tankName}
      </p>

      <div className="grid grid-cols-2 gap-y-1 gap-x-4">
        <div className="flex gap-1">
          <p className="text-sm">Turbidez:</p>
          <p className="text-sm font-bold">{turbidity} NTU</p>
        </div>
        <div className="flex gap-1">
          <p className="text-sm">Temperatura:</p>
          <p className="text-sm font-bold">{temperature}ºC</p>
        </div>
        <div className="flex gap-1">
          <p className="text-sm">Qualidade:</p>
          <p className={`text-sm font-bold ${color}`}>{text}</p>
        </div>
        <div className="flex gap-1">
          <p className="text-sm">Oxigênio:</p>
          <p className="text-sm font-bold">{oxygen} mg/L</p>
        </div>
        <div className="flex gap-1">
          <p className="text-sm">pH:</p>
          <p className="text-sm font-bold">{ph}</p>
        </div>
        <div className="flex gap-1">
          <p className="text-sm">Amônia:</p>
          <p className="text-sm font-bold">{ammonia} mg/L</p>
        </div>
        <div className="flex gap-2 col-span-2">
          <div
            className="flex gap-1 items-center cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            <p className="text-sm underline">Cor da água:</p>
            <div
              className="w-5 h-5 rounded-sm border border-border cursor-pointer hover:scale-110 transition-transform"
              style={{
                backgroundImage:
                  waterColor >= 0
                    ? `url(${imageTanksList[waterColor as number]})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              title="Clique para expandir a imagem"
            />
          </div>
        </div>
      </div>

      {/* Modal para expandir a imagem da cor da água */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-lg w-[90%]">
          <DialogHeader>
            <DialogTitle>Cor da água - {tankName}</DialogTitle>
          </DialogHeader>

          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              {waterColor >= 0 && (
                <Image
                  src={imageTanksList[waterColor as number]}
                  alt="Cor da água"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-lg border border-border"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              )}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Registro feito em {time} - {date}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para informações do tanque */}
      <Dialog open={isTankModalOpen} onOpenChange={setIsTankModalOpen}>
        <DialogContent className="max-w-lg w-[90%]">
          <DialogHeader>
            <DialogTitle>Informações do Tanque</DialogTitle>
          </DialogHeader>

          {tankInfo ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-600">
                  {tankInfo.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Espécie de peixe:</span>
                  <span className="text-right">
                    {tankInfo.fish || "Não informado"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Quantidade de peixes:</span>
                  <span className="text-right">
                    {tankInfo.fishCount || "Não informado"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Peso médio:</span>
                  <span className="text-right">
                    {tankInfo.averageWeight
                      ? `${tankInfo.averageWeight
                          .toString()
                          .replace(".", ",")} kg`
                      : "Não informado"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Área do tanque:</span>
                  <span className="text-right">
                    {tankInfo.tankArea
                      ? `${tankInfo.tankArea.toString().replace(".", ",")} m²`
                      : "Não informado"}
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Dados do tanque cadastrado
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Informações do tanque não encontradas
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                O tanque &quot;{tankName}&quot; pode ter sido removido
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HistoryItem;
