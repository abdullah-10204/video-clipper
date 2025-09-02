import "./globals.css";

export const metadata = {
  title: "PodClip Pro - Professional Podcast Clipping",
  description: "Transform your podcasts into viral clips with professional collaboration tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}