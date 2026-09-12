import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GTMTS - ระบบบริหารจัดการองค์กร",
    short_name: "GTMTS",
    description: "ระบบสารสนเทศภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
