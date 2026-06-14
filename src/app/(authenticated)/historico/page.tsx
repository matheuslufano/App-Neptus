"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileSpreadsheet, FileText, Share } from "lucide-react";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import AppButton from "@/components/AppButton";
import { colorRangeData } from "@/components/ColorRangeSelector";
import DateRangePicker from "@/components/DateRangePicker";
import TurbidityForm from "@/components/forms/TurbidityForm";
import HistoryItem from "@/components/HistoryItem";
import PageHeader from "@/components/PageHeader";
import TurbidityHeader from "@/components/TurbidityHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTanks } from "@/hooks/useTanks";
import { readingsDb } from "@/lib/db";
import { TurbidityFormSchema } from "@/schemas/turbidity-schema";
import { usePropertyStore } from "@/stores/propertyStore";
import { getQualityColor } from "@/utils/turbidity-util";

// Tipo para os dados mapeados para exibição
interface HistoryItem {
  id: string;
  time: string;
  date: string;
  tankId: string;
  tankName: string;
  turbidity: number;
  temperature: number;
  quality: string;
  oxygen: number;
  ph: number;
  ammonia: number;
  waterColor: number;
  syncStatus?: "synced" | "pending" | "error";
  errorMessage?: string;
}

const History = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const { tanks } = useTanks();
  const { selectedPropertyId } = usePropertyStore();

  const fetchHistory = React.useCallback(async () => {
    if (!selectedPropertyId) return;

    try {
      const readings = await readingsDb.getByProperty(selectedPropertyId);
      const mapped = readings.map((r): HistoryItem => {
        const tank = tanks.find((t) => t.id === r.tankId);
        const date = new Date(r.createdAt);
        return {
          id: r.id,
          tankId: r.tankId,
          time: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: date.toLocaleDateString([], {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
          tankName: tank?.name || "-",
          turbidity: r.turbidez,
          temperature: r.temperatura ?? 0,
          quality: getQualityColor(r.turbidez).text,
          oxygen: r.oxigenio ?? 0,
          ph: r.ph ?? 0,
          ammonia: r.amonia ?? 0,
          waterColor: r.cor_agua ?? 0,
          syncStatus: r.syncStatus,
          errorMessage: r.errorMessage,
        };
      });
      setHistoryData(mapped);
    } catch (error) {
      console.error("Erro ao buscar histórico via Dexie:", error);
    }
  }, [tanks, selectedPropertyId]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleEdit = (id: string) => {
    const item = historyData.find((item) => item.id === id);
    if (item) {
      setSelectedItem(item);
      setIsEditDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    await readingsDb.remove(selectedItemId);
    await fetchHistory();
    setIsDeleteDialogOpen(false);
    setSelectedItemId("");
  };

  const handleEditSubmit = async (data: TurbidityFormSchema) => {
    if (!selectedItem) return;

    await readingsDb.update(selectedItem.id, {
      tankId: data.tanque,
      oxigenio: data.oxigenio,
      temperatura: data.temperatura,
      ph: data.ph,
      amonia: data.amonia,
      cor_agua: data.cor_agua,
      // Se estava com erro e foi editado, tentar dar override para sync novamente
      syncStatus: "pending",
    });

    await fetchHistory();
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  // Função auxiliar para converter string de data DD/MM/AAAA ou DD/MM/AA para Date
  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString === "--/--/--") return null;

    // Tenta fazer o parse da data no formato DD/MM/AAAA ou DD/MM/AA
    const dateMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (!dateMatch) return null;

    const [, day, month, yearStr] = dateMatch;

    // Se o ano tem 2 dígitos, assumir que é 20XX
    let year = parseInt(yearStr);
    if (yearStr.length === 2) {
      year = year + 2000; // 25 vira 2025
    }

    const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));

    // Verifica se a data é válida
    if (isNaN(parsedDate.getTime())) return null;

    return parsedDate;
  };

  // Dados filtrados por período
  const filteredData = useMemo(() => {
    // Se não há filtro, retorna todos os dados
    if (!dateRange?.from && !dateRange?.to) {
      return historyData;
    }

    const filtered = historyData.filter((item) => {
      const itemDate = parseDate(item.date);
      if (!itemDate) return false;

      // Configurar datas de filtro
      let includeItem = true;

      if (dateRange.from) {
        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0); // Início do dia

        if (itemDate < startDate) {
          includeItem = false;
        }
      }

      if (dateRange.to && includeItem) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999); // Final do dia

        if (itemDate > endDate) {
          includeItem = false;
        }
      }

      if (includeItem) {
        // Item aceito para o filtro
      }

      return includeItem;
    });

    return filtered;
  }, [historyData, dateRange]);

  // Função para exportar em CSV (planilha)
  const exportToCSV = () => {
    const headers = [
      "Data",
      "Hora",
      "Tanque",
      "Tipo do Tanque",
      "Espécie de Peixe",
      "Quantidade de Peixes",
      "Peso Médio (kg)",
      "Área do Tanque (m²)",
      "Turbidez (NTU)",
      "Temperatura (°C)",
      "Qualidade",
      "Oxigênio (mg/L)",
      "pH",
      "Amônia (mg/L)",
    ];

    const csvData = filteredData.map((item) => {
      // Encontrar informações do tanque
      const tankInfo = tanks.find((tank) => tank.name === item.tankName);

      return [
        item.date,
        item.time,
        item.tankName,
        tankInfo?.type || "Não informado",
        tankInfo?.fish || "Não informado",
        tankInfo?.fishCount?.toString() || "Não informado",
        tankInfo?.averageWeight?.toString().replace(".", ",") ||
          "Não informado",
        tankInfo?.tankArea?.toString().replace(".", ",") || "Não informado",
        item.turbidity.toString().replace(".", ","),
        item.temperature.toString().replace(".", ","),
        item.quality,
        item.oxygen.toString().replace(".", ","),
        item.ph.toString().replace(".", ","),
        item.ammonia.toString().replace(".", ","),
      ];
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `historico-turbidez-${format(new Date(), "dd-MM-yyyy")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar em PDF
  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Lista de imagens dos tanques para referência das cores
    const imageTanksList = [
      "Transparente Claro",
      "Transparente Escuro",
      "Amarelo Claro",
      "Amarelo Escuro",
      "Verde Claro",
      "Verde Escuro",
    ];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Histórico de Turbidez</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 10px; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .date-range {
              text-align: center;
              margin-bottom: 20px;
              font-style: italic;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 9px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              vertical-align: top;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
              font-size: 10px;
            }
            .quality-good { color: #22c55e; font-weight: bold; }
            .quality-regular { color: #eab308; font-weight: bold; }
            .quality-bad { color: #ef4444; font-weight: bold; }
            .tank-info { 
              font-size: 8px; 
              color: #666; 
              margin-top: 2px;
            }
            @media print {
              body { margin: 0; font-size: 9px; }
              .no-print { display: none; }
              table { font-size: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Histórico de Turbidez</h1>
            <p>Sistema de Monitoramento Aquático</p>
          </div>
          
          ${
            dateRange?.from || dateRange?.to
              ? `
            <div class="date-range">
              Período: ${
                dateRange?.from
                  ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  : "Início"
              } 
              até ${
                dateRange?.to
                  ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  : "Fim"
              }
            </div>
          `
              : ""
          }
          
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">Data</th>
                <th style="width: 6%;">Hora</th>
                <th style="width: 12%;">Tanque</th>
                <th style="width: 8%;">Turbidez (NTU)</th>
                <th style="width: 8%;">Temp. (°C)</th>
                <th style="width: 8%;">Qualidade</th>
                <th style="width: 8%;">O₂ (mg/L)</th>
                <th style="width: 6%;">pH</th>
                <th style="width: 8%;">NH₃ (mg/L)</th>
                <th style="width: 12%;">Cor da Água</th>
                <th style="width: 16%;">Info. do Tanque</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map((item) => {
                  // Encontrar informações do tanque
                  const tankInfo = tanks.find(
                    (tank) => tank.name === item.tankName,
                  );
                  const waterColorName =
                    item.waterColor >= 0
                      ? imageTanksList[item.waterColor]
                      : "Não definida";

                  return `
                <tr>
                  <td>${item.date}</td>
                  <td>${item.time}</td>
                  <td><strong>${item.tankName}</strong></td>
                  <td>${item.turbidity.toString().replace(".", ",")}</td>
                  <td>${item.temperature.toString().replace(".", ",")}</td>
                  <td class="quality-${
                    item.quality === "Bom"
                      ? "good"
                      : item.quality === "Regular"
                        ? "regular"
                        : "bad"
                  }">${item.quality}</td>
                  <td>${item.oxygen.toString().replace(".", ",")}</td>
                  <td>${item.ph.toString().replace(".", ",")}</td>
                  <td>${item.ammonia.toString().replace(".", ",")}</td>
                  <td><strong>${waterColorName}</strong></td>
                  <td>
                    <div><strong>Tipo:</strong> ${tankInfo?.type || "N/I"}</div>
                    <div class="tank-info"><strong>Espécie:</strong> ${
                      tankInfo?.fish || "N/I"
                    }</div>
                    <div class="tank-info"><strong>Qtd Peixes:</strong> ${
                      tankInfo?.fishCount || "N/I"
                    }</div>
                    <div class="tank-info"><strong>Peso Médio:</strong> ${
                      tankInfo?.averageWeight
                        ? tankInfo.averageWeight.toString().replace(".", ",") +
                          " kg"
                        : "N/I"
                    }</div>
                    <div class="tank-info"><strong>Área:</strong> ${
                      tankInfo?.tankArea
                        ? tankInfo.tankArea.toString().replace(".", ",") + " m²"
                        : "N/I"
                    }</div>
                  </td>
                </tr>
              `;
                })
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
            Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className="space-y-5">
      <PageHeader
        title="Histórico de registros"
        description="Filtre pela data"
      />

      <div className="flex justify-between w-full gap-5">
        <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AppButton variant={"outline"} size={"lg"}>
              <Share />
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar em PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar em planilha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-5">
        {filteredData.map((item) => (
          <HistoryItem
            key={item.id}
            id={item.id}
            time={item.time}
            date={item.date}
            tankName={item.tankName}
            turbidity={item.turbidity}
            temperature={item.temperature}
            quality={item.quality as "Bom" | "Regular" | "Ruim"}
            oxygen={item.oxygen}
            ph={item.ph}
            ammonia={item.ammonia}
            waterColor={item.waterColor}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este registro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </AppButton>
              <AppButton variant="destructive" onClick={confirmDelete}>
                Excluir
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
            <DialogDescription>
              Revise e edite as informações do registro
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {selectedItem && (
              <TurbidityHeader
                turbidityValue={selectedItem.turbidity}
                quality={selectedItem.quality as "Bom" | "Regular" | "Ruim"}
                timestamp={{
                  time: selectedItem.time,
                  date: selectedItem.date,
                }}
              />
            )}

            <TurbidityForm
              onSubmit={handleEditSubmit}
              id="edit-turbidity-form"
              initialValues={
                selectedItem
                  ? {
                      tanque: selectedItem.tankId,
                      cor_agua: selectedItem.waterColor,
                      oxigenio: selectedItem.oxygen,
                      temperatura: selectedItem.temperature,
                      ph: selectedItem.ph,
                      amonia: selectedItem.ammonia,
                    }
                  : undefined
              }
            />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </AppButton>
              <AppButton type="submit" form="edit-turbidity-form">
                Salvar alterações
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default History;
