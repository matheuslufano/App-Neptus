"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

import usePWAInstall from "@/hooks/usePWAInstall";

import AppButton from "./AppButton";

interface InstallAppButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  text?: string;
}

const InstallAppButton = ({
  variant = "default",
  size = "default",
  className = "",
  text = "Instalar App",
}: InstallAppButtonProps) => {
  const { isInstallable, isInstalled, isInstalling, installApp, canInstall } =
    usePWAInstall();

  const handleInstallClick = async () => {
    await installApp();
  };

  // Não mostra se já estiver instalado ou não for instalável
  if (isInstalled || !isInstallable || !canInstall) {
    return null;
  }

  return (
    <AppButton
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleInstallClick}
      disabled={isInstalling}
    >
      <Download className="w-4 h-4" />
      {isInstalling ? "Instalando..." : text}
    </AppButton>
  );
};

// Componente para mostrar informações sobre instalação
export const InstallInfo = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsInstalled(isStandalone);
    };

    checkIfInstalled();
  }, []);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="w-4 h-4" />
        <span>App instalado</span>
      </div>
    );
  }

  return null;
};

export default InstallAppButton;
