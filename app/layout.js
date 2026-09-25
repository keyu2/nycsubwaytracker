import "./globals.css";

const THEME_INITIALIZER = `
  try {
    const theme = localStorage.getItem("subway-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
  } catch {}
`;

export const metadata = {
  title: "NYC Subway",
  description: "NYC Subway real-time information",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
