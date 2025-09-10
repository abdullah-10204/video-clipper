// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

export const metadata = {
  title: "PodClip Pro",
  description: "Edit your podcasts and create clips",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
