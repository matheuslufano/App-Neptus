import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let engagementScore = 0;
let interactionCount = 0;
let lastInteractionTime = 0;

const trackEngagement = () => {
  const now = Date.now();
  interactionCount++;
  if (now - lastInteractionTime > 1000) {
    engagementScore += 1;
    lastInteractionTime = now;
  }
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsInstalled(isStandalone);

      // Se já estiver instalado, não é instalável
      if (isStandalone) {
        setIsInstallable(false);
      }
    };

    const checkIfIOS = () => {
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      setIsIOS(iOS);
      setIsMobile(mobile);

      // No iOS, sempre consideramos "instalável" mesmo sem o evento beforeinstallprompt
      if (iOS && !isInstalled) {
        setIsInstallable(true);
      }

      // No Android mobile, também marca como instalável (pode ser via prompt manual)
      if (mobile && !iOS && !isInstalled) {
        setIsInstallable(true);
      }
    };

    checkIfInstalled();
    checkIfIOS();

    if (isMobile && !isIOS && !isInstalled) {
      const events = ["click", "scroll", "keydown", "touchstart", "touchend"];
      events.forEach((event) => {
        document.addEventListener(event, trackEngagement, { passive: true });
      });
      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, trackEngagement);
        });
      };
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isInstalled) {
        setIsInstallable(true);
        setShowManualPrompt(false);
      }
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsInstalling(false);
    };

    // Verifica se o prompt foi rejeitado anteriormente
    const wasRejected = localStorage.getItem("pwa-install-dismissed");
    const rejectedTime = wasRejected ? parseInt(wasRejected) : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 horas

    // Reset após 24 horas
    if (rejectedTime && rejectedTime < oneDayAgo) {
      localStorage.removeItem("pwa-install-dismissed");
    }

    // Timeout para mostrar prompt manual no mobile Android se o automático não funcionar
    if (isMobile && !isIOS && !isInstalled && !deferredPrompt) {
      const timeout = setTimeout(() => {
        if (engagementScore < 10) {
          setIsInstallable(true);
          setShowManualPrompt(true);
        } else {
          // Se tem alto engagement, aguarda mais tempo para o prompt automático
          setTimeout(() => {
            if (!deferredPrompt) {
              setIsInstallable(true);
              setShowManualPrompt(true);
            }
          }, 30000); // Reduzido para 30 segundos
        }
      }, 5000); // Reduzido para 5 segundos para testar

      return () => clearTimeout(timeout);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // No mobile Android, aguarda apenas 2 segundos para dar chance ao beforeinstallprompt
    // Se não disparar rapidamente, já mostra a opção manual
    let timeoutId: NodeJS.Timeout | undefined;

    if (isMobile && !isIOS && !isInstalled) {
      timeoutId = setTimeout(() => {
        if (!deferredPrompt) {
          setShowManualPrompt(true);
        }
      }, 2000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isMobile, isIOS, deferredPrompt]);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt || isInstalling) return false;

    try {
      setIsInstalling(true);

      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        // O evento 'appinstalled' será disparado automaticamente
        return true;
      } else {
        // Usuário rejeitou
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
        setDeferredPrompt(null);
        setIsInstallable(false);
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  const dismissInstallPrompt = () => {
    setIsInstallable(false);
    setShowManualPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const showManualInstructions = () => {
    // Para Android Chrome
    alert(
      "Para instalar o app:\n\n" +
        "1. Toque no menu (⋮) do Chrome\n" +
        "2. Procure por 'Instalar app' ou 'Adicionar à tela inicial'\n" +
        "3. Confirme a instalação\n\n" +
        "💡 Dica: Use a opção 'Instalar app' se disponível para experiência nativa!\n\n" +
        "Ou acesse as configurações do Chrome > Site e limpe os dados para resetar o prompt.",
    );
  };

  const forceEngagement = () => {
    // Força pontuação alta de engagement
    engagementScore = 20;
    interactionCount = 50;

    // Tenta disparar eventos que o Chrome monitora
    setTimeout(() => {
      // Simula navegação
      window.history.pushState({}, "", window.location.pathname);
      window.history.pushState({}, "", window.location.pathname);
    }, 100);
  };

  return {
    isInstallable: isInstallable || showManualPrompt,
    isInstalled,
    isInstalling,
    isIOS,
    isMobile,
    showManualPrompt,
    engagementScore,
    installApp,
    dismissInstallPrompt,
    showManualInstructions,
    forceEngagement,
    canInstall:
      (isInstallable && (!!deferredPrompt || isIOS)) || showManualPrompt,
    deferredPrompt,
  };
};

export default usePWAInstall;
