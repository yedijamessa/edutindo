import type { Metadata, Viewport } from "next";
import "./citacitaku.css";

export const metadata: Metadata = {
  title: "Cita-cita Ku — Ada banyak jalan menuju masa depanmu",
  description: "Panduan sederhana untuk pelajar SMA Indonesia merencanakan langkah menuju cita-cita.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbfcf8",
  width: "device-width",
  initialScale: 1,
};

export default function CitacitakuLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
