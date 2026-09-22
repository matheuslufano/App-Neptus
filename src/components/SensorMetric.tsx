import { ReactNode } from "react";

import Box from "./Box";

interface SensorMetricProps {
  title: string;
  value?: string | number;
  unit?: string;
  children?: ReactNode;
  className?: string;
}

const SensorMetric = ({
  title,
  value,
  unit,
  children,
  className,
}: SensorMetricProps) => {
  return (
    <Box className={className}>
      <h3 className="font-semibold text-muted-foreground">{title}</h3>
      <p className="text-2xl font-semibold mt-3">
        {value === undefined ? "--" : value} {unit}
      </p>
      {children}
    </Box>
  );
};

export default SensorMetric;
