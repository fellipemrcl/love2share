import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love2Share - Admin Panel",
  description: "Administrative panel for Love2Share streaming service sharing platform.",
  icons: {
    icon: "/admin/icon.svg",
    apple: "/admin/apple-touch-icon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
