import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BoxProps {
  children: ReactNode;
  className?: string;
}

const Box = ({ children, className }: BoxProps) => {
  return (
    <div className={cn("border bg-muted p-4 rounded-lg shadow-md", className)}>
      {children}
    </div>
  );
};
export default Box;
