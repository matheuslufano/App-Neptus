import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Neptus - Monitoramento de Qualidade da Água",
    short_name: "Neptus",
    description:
      "Monitoramento da qualidade da água em tanques de peixe em tempo real",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    lang: "pt-BR",
    scope: "/",
    orientation: "portrait",
    icons: [
      {
        src: "/assets/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/assets/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/assets/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/assets/icon-1024x1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
