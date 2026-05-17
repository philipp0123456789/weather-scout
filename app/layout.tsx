import type { ReactNode } from "react";

export const metadata = {
  title: "Weather Scout",
  description: "Telegram-based weather and outfit assistant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
