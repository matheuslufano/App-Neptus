"use client";

import { BluetoothIcon, Save, Settings, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppButton from "@/components/AppButton";
import BluetoothConfig from "@/components/BluetoothConfig";
import DeviceStatus from "@/components/DeviceStatus";
import LoadingFullScreen from "@/components/LoadingFullScreen";
import MultiMetricCard from "@/components/MultiMetricCard";
import { useAuthState } from "@/components/OfflineAuthManager";
import PageHeader from "@/components/PageHeader";
import SensorMetric from "@/components/SensorMetric";
import TurbidityDisplay from "@/components/TurbidityDisplay";
import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useSensorData } from "@/hooks/useSensorData";
import { readingsDb } from "@/lib/db";
import { tanksDb } from "@/lib/db";
import { usePropertyStore } from "@/stores/propertyStore";

import AdditionalParameters from "./_components/AdditionalParameters/page";

// Tipo para o último registro de amostra
interface LastSampleData {
  id: string;
  dadosTurbidez?: {
    valor: number;
    qualidade: string;
    dataHora: {
      hora: string;
      data: string;
    };
  };
  tanque?: string;
  oxigenio?: number;
  temperatura?: number;
  ph?: number;
  amonia?: number;
  cor_agua?: number;
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const { isOnline } = useInternetConnection();
  const { sensorData, isLoading, error, refetch, isConnected } =
    useSensorData();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isBluetoothConfigOpen, setIsBluetoothConfigOpen] = useState(false);
  const [lastSampleData, setLastSampleData] = useState<LastSampleData | null>(
    null,
  );
  
  const { selectedPropertyId } = usePropertyStore();

  const [storedData, setStoredData] = useState<{
    turbidityValue: number;
    timestamp: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  // Função para buscar o último registro de amostra
  const fetchLastSampleData = useCallback(async () => {
    try {
      if (!selectedPropertyId) return;

      const readings = await readingsDb.getByProperty(selectedPropertyId);
      if (readings && readings.length > 0) {
        // As leituras já vêm ordenadas por createdAt DESC pelo readingsDb.getByProperty
        const latest = readings[0];
        // Buscar nome do tanque
        const tank = latest.tankId
          ? (await tanksDb.getByProperty(selectedPropertyId)).find(
              (t) => t.id === latest.tankId,
            )
          : undefined;

        setLastSampleData({
          id: latest.id,
          tanque: tank?.name || "-",
          oxigenio: latest.oxigenio,
          temperatura: latest.temperatura,
          ph: latest.ph,
          amonia: latest.amonia,
          cor_agua: latest.cor_agua,
        });
      } else {
        setLastSampleData(null);
      }
    } catch (error) {
      console.error("Erro ao buscar último registro:", error);
    }
  }, [selectedPropertyId]);

  // Carregar último registro ao montar o componente e quando modal fechar
  useEffect(() => {
    fetchLastSampleData();
  }, [fetchLastSampleData, isOpenModal]);

  // Valor da turbidez para exibição
  const turbidityValue = sensorData?.turbidez || 0;

  // Status da última atualização
  const getLastUpdatedText = () => {
    // Mostra status da conexão com a INTERNET
    if (!isOnline) return "Você está offline";
    return "Conectado à internet";
  };

  const handleSaveReading = () => {
    if (!sensorData) return;
    setIsOpenModal(true);
    // TODO: Implementar salvamento quando necessário
    localStorage.setItem(
      "turbidityData",
      JSON.stringify({ turbidityValue, timestamp: new Date().toISOString() }),
    );
    setStoredData({ turbidityValue, timestamp: new Date().toISOString() });
  };

  const handleRefreshSensorData = async () => {
    setIsRefreshing(true);
    const start = Date.now();
    try {
      await refetch();
    } catch (error) {
      console.error("Erro ao atualizar leitura do sensor:", error);
    } finally {
      const minDuration = 600;
      const elapsed = Date.now() - start;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed)); 
      }
      setIsRefreshing(false);
    }
  };

  if (authLoading) {
    return <LoadingFullScreen />;
  }

  return (
    <>
      <main className="space-y-5">
        <PageHeader
          title="Leitura de turbidez"
          description={getLastUpdatedText()}
        />

       {isConnected ? (
          <div className="space-y-3">
            <TurbidityDisplay turbidityValue={turbidityValue} />

            <div className="flex gap-2">
              <AppButton
                className="flex-1"
                size="lg"
                onClick={handleSaveReading}
                disabled={isLoading || !sensorData}
              >
                <Save />
                Registrar e continuar
              </AppButton>
              <AppButton
                className="flex-1"
                variant="outline"
                size="lg"
                onClick={handleRefreshSensorData}
                disabled={isLoading || isRefreshing}
                aria-label="Atualizar leitura"
              >
                <RotateCw 
                  className={
                    isRefreshing ? "animate-spin" : undefined
                  }
                />
              </AppButton>
              <AppButton
                className="flex-1"
                variant="outline"
                size="lg"
                onClick={() => setIsBluetoothConfigOpen(true)}
              >
                <Settings />
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <AppButton
              variant="default"
              size="lg"
              onClick={refetch}
              disabled={isLoading}
            >
              <BluetoothIcon />
              Conectar ao dispositivo
            </AppButton>
          </div>
        )}

        <div className="grid grid-cols-2 grid-rows-2 gap-5">
          <SensorMetric
            title="Oxigênio Dissolvido"
            value={lastSampleData?.oxigenio}
            unit={"mg/L"}
            className="col-span-1"
          />

          <SensorMetric
            title="Temperatura"
            value={lastSampleData?.temperatura}
            unit={"ºC"}
            className="col-span-1"
          />

          <MultiMetricCard
            metrics={[
              { title: "pH", value: lastSampleData?.ph },
              { title: "Amônia", value: lastSampleData?.amonia, unit: "mg/L" },
            ]}
            className="col-span-1"
          />

          <DeviceStatus
            batteryLevel={67}
            isConnected={isConnected}
            deviceName="ESP32-Turbidez"
            className="col-span-1"
          />
        </div>

        { isConnected ? (
          <div className="flex justify-center ">
              <AppButton className="w-53"
                variant="secondary"
                size="lg"
                onClick={() => router.push("/calibracao")}
            >
              Modo calibração
            </AppButton>
          </div>
        ) : null }  


      </main>

      <AdditionalParameters
        isOpen={isOpenModal}
        onOpenChange={setIsOpenModal}
        storedData={storedData}
      />

      <BluetoothConfig
        isOpen={isBluetoothConfigOpen}
        onClose={() => setIsBluetoothConfigOpen(false)}
        onSuccess={() => setIsBluetoothConfigOpen(false)}
      />
    
    </>
  );
}
