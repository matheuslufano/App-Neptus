import AppButton from "@/components/AppButton";

interface CalibrationStepListProps {
  activeStepIndex: number;
  steps: string[];
  onConfirm: () => void;
  isConnected?: boolean;
}

const CalibrationStepList = ({
  activeStepIndex,
  steps,
  onConfirm,
  isConnected = false,
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
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition-colors ${
              index === activeStepIndex
                ? "bg-primary/10 text-primary"
                : "bg-slate-50 text-muted-foreground"
            }`}
          >
            <span>{step}</span>
            {index === activeStepIndex ? <span className="font-semibold">Ativo</span> : null}
          </div>
        ))}
      </div>
      <AppButton variant="outline" onClick={onConfirm} disabled={!isConnected || activeStepIndex < 0}>
        CONFIRM
      </AppButton>
    </div>
  );
};

export default CalibrationStepList;
