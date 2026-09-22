import { Clock } from "lucide-react";

interface TurbidityHeaderProps {
  turbidityValue: number;
  quality: "Bom" | "Regular" | "Ruim";
  timestamp: {
    time: string;
    date: string;
  };
}

const TurbidityHeader = ({
  turbidityValue,
  quality,
  timestamp,
}: TurbidityHeaderProps) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Boa":
        return "text-success";
      case "Regular":
        return "text-warning";
      case "Ruim":
        return "text-error";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-5 p-4 bg-muted border rounded-md relative">
      <div className="flex flex-col col-span-3 border-r border-foreground/20">
        <h2 className="text-lg font-semibold">Turbidez {turbidityValue} NTU</h2>
        <p className="text-md">
          Qualidade: <span className={getQualityColor(quality)}>{quality}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 col-span-2 pl-4">
        <Clock width={20} />
        <div className="flex flex-col">
          <p className="text-sm">{timestamp.time}</p>
          <p className="text-sm">{timestamp.date}</p>
        </div>
      </div>
    </div>
  );
};

export default TurbidityHeader;
