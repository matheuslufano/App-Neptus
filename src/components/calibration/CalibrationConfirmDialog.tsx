"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AppButton from "@/components/AppButton";

interface CalibrationConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CalibrationConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
}: CalibrationConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm w-[90%] gap-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-lg">Tem certeza disso?</DialogTitle>
          <DialogDescription className="text-sm leading-6">
            Atenção! Esse processo irá iniciar o modo de calibração do sensor.
            Certifique-se de que o dispositivo está corretamente conectado antes
            de prosseguir.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 flex-col">
          <AppButton
            onClick={onConfirm}
            className="w-full"
            size="lg"
          >
            Sim
          </AppButton>
          <AppButton
            variant="outline"
            onClick={onCancel}
            className="w-full"
            size="lg"
          >
            Não
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalibrationConfirmDialog;
