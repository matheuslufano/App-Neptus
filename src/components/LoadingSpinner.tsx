import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={`flex items-center justify-center p-4 w-full h-full ${
        className || ""
      }`}
    >
      <Loader2
        className={`animate-spin w-10 h-10 text-primary ${className || ""}`}
      />
    </div>
  );
};
export default LoadingSpinner;
