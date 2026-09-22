import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import TurbidityForm from "@/components/forms/TurbidityForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { readingsDb } from "@/lib/db";
import { TurbidityFormSchema } from "@/schemas/turbidity-schema";
import { usePropertyStore } from "@/stores/propertyStore";
import { getQualityColor } from "@/utils/turbidity-util";

import TurbidityHeader from "../../../../components/TurbidityHeader";

interface AdditionalParametersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storedData: {
    turbidityValue: number;
    timestamp: string;
  } | null;
}

const AdditionalParameters = ({
  isOpen,
  onOpenChange,
  storedData,
}: AdditionalParametersProps) => {
  const { text } = getQualityColor(storedData?.turbidityValue || 0);
  const { selectedPropertyId } = usePropertyStore();

  const hourAndMinute = useMemo(() => {
    return storedData
      ? new Date(storedData.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";
  }, [storedData]);

  const dayMonthYear = useMemo(() => {
    return storedData
      ? new Date(storedData.timestamp).toLocaleDateString([], {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "--/--/--";
  }, [storedData]);

  const dadosTurbidez = useMemo(
    () => ({
      valor: storedData?.turbidityValue || 0,
      qualidade: text,
      dataHora: { hora: hourAndMinute, data: dayMonthYear },
    }),
    [storedData?.turbidityValue, text, hourAndMinute, dayMonthYear],
  );

  const handleSubmit = useCallback(
    async (data: TurbidityFormSchema) => {
      if (!selectedPropertyId) {
        toast.error(
          "Propriedade não selecionada! É necessário selecionar uma propriedade no Menu lateral antes de salvar amóstras.",
        );
        console.error("PropertyId não encontrado");
        return;
      }

      await readingsDb.add({
        propertyId: selectedPropertyId,
        tankId: data.tanque,
        turbidez: dadosTurbidez.valor,
        temperatura: data.temperatura,
        ph: data.ph,
        oxigenio: data.oxigenio,
        amonia: data.amonia,
        cor_agua: data.cor_agua,
      });

      localStorage.removeItem("turbidityData");
      console.log("Dados de turbidez registrados", data);
      onOpenChange(false);
    },
    [dadosTurbidez, onOpenChange, selectedPropertyId],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Parâmetros adicionais</DialogTitle>
          <DialogDescription>
            Revise e adicione informações complementares
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <TurbidityHeader
            turbidityValue={dadosTurbidez.valor}
            quality={dadosTurbidez.qualidade as "Bom" | "Regular" | "Ruim"}
            timestamp={{
              time: dadosTurbidez.dataHora.hora,
              date: dadosTurbidez.dataHora.data,
            }}
          />

          <TurbidityForm onSubmit={handleSubmit} id="turbidity-form" />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <AppButton variant="outline" size="lg">
              Cancelar
            </AppButton>
          </DialogClose>
          <AppButton size="lg" type="submit" form="turbidity-form">
            Salvar amostra
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalParameters;
