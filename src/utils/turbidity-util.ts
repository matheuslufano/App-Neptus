export const getQualityColor = (turbidityQtd: number) => {
  if (turbidityQtd > 100) {
    return { color: "text-error", text: "Ruim" };
  } else if (turbidityQtd > 40) {
    return { color: "text-warning", text: "Médio" };
  } else {
    return { color: "text-success", text: "Boa" };
  }
};
