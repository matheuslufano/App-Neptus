import Box from "./Box";

interface Metric {
  title: string;
  value?: string | number;
  unit?: string;
}

interface MultiMetricCardProps {
  metrics: Metric[];
  className?: string;
}

const MultiMetricCard = ({ metrics, className }: MultiMetricCardProps) => {
  return (
    <Box className={className}>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <h3 className="font-semibold text-muted-foreground">
              {metric.title}
            </h3>
            <p className="text-2xl font-semibold mt-3">
              {metric.value === undefined ? "--" : metric.value} {metric.unit}
            </p>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default MultiMetricCard;
