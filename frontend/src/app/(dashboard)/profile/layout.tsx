import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Goose Exchange",
  description: "Manage your profile",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 