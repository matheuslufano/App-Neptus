import AppButton from "@/components/AppButton";

interface CalibrationStepListProps {
  activeStepIndex: number;
  steps: string[];
  onConfirm: () => void;
  isConnected?: boolean;
  disabled?: boolean;
}

// Componente para exibir a lista de etapas de calibração, destacando a etapa ativa e permitindo confirmação quando conectado.
const CalibrationStepList = ({
  activeStepIndex,
  steps,
  onConfirm,
  isConnected = false,
  disabled = false,
}: CalibrationStepListProps) => {
  return (
    <div className="space-y-2 rounded-3xl border border-border bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Etapas de calibração</p>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {activeStepIndex >= 0 ? activeStepIndex + 1 : 0}/{steps.length}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const stepStyle =
            index < activeStepIndex
              ? "bg-emerald-500/15 text-emerald-700"
              : index === activeStepIndex
              ? "bg-sky-500 text-white shadow-lg shadow-sky-300"
              : "bg-slate-200 text-muted-foreground";

          return (
            <div
              key={step}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition duration-200 transform ${stepStyle}`}
            >
              <span>{step}</span>
              {index === activeStepIndex ? <span className="font-semibold">Ativo</span> : null}
            </div>
          );
        })}
      </div>
      <AppButton
        className="w-full"
        variant="default"
        onClick={onConfirm}
        disabled={!isConnected || activeStepIndex < 0 || disabled}
      >
        CONFIRM
      </AppButton>
    </div>
  );
};

export default CalibrationStepList;
