"use client";

import { Info, Share, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const IOSInstallInfo = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafariMobile =
      /Safari/.test(navigator.userAgent) &&
      !/(Chrome|CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone;

    setIsIOS(iOS);
    setIsSafari(isSafariMobile);
    setIsInstalled(isStandalone);
  }, []);

  if (!isIOS) {
    return null;
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
        <Smartphone className="w-4 h-4" />
        <span>App instalado no iOS</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Instalação no iPhone/iPad
            </h4>
            <p className="text-sm text-blue-700">
              No iOS, a instalação é feita manualmente através do Safari:
            </p>
          </div>

          <ol className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                Abra este site no <strong>Safari</strong> (não funciona no
                Chrome iOS)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                2
              </span>
              <span className="flex items-center gap-1">
                Toque no botão <Share className="w-4 h-4 inline" />{" "}
                <strong>Compartilhar</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                Selecione{" "}
                <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                4
              </span>
              <span>
                Confirme tocando em <strong>&ldquo;Adicionar&rdquo;</strong>
              </span>
            </li>
          </ol>

          {!isSafari && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Você está usando outro navegador.</strong> Para
                instalar o app no iOS, você precisa abrir este site no Safari.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IOSInstallInfo;
