import { Bluetooth, Link2Off } from "lucide-react";

import Box from "./Box";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface DeviceStatusProps {
  batteryLevel: number;
  isConnected: boolean;
  className?: string;
  deviceName?: string;
}

const DeviceStatus = ({
  batteryLevel,
  isConnected,
  className,
  deviceName,
}: DeviceStatusProps) => {
  const getConnectionIcon = () => {
    if (!isConnected) return <Link2Off />;
    return <Bluetooth />;
  };

  const getConnectionText = () => {
    if (!isConnected) return "Desconectado";
    return deviceName || "Bluetooth";
  };

  return (
    <Box className={className}>
      <h3 className="font-semibold text-muted-foreground mb-4">Status</h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground/80">Bateria {batteryLevel}%</p>
          <Progress value={batteryLevel} className="h-2.5" />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-foreground/80">Conexão</p>
          <Badge
            data-isconnected={isConnected ? "true" : "false"}
            className="rounded-full w-full h-6 data-[isconnected=true]:bg-success data-[isconnected=false]:bg-destructive"
          >
            {getConnectionIcon()}
            {getConnectionText()}
          </Badge>
        </div>
      </div>
    </Box>
  );
};

export default DeviceStatus;
