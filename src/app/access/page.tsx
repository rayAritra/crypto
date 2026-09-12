import { AccessClient } from "@/components/access/AccessClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Token Access",
  description:
    "Connect a wallet, inspect HoodLens access, purchase analytics credits, and prepare creator launches.",
  alternates: { canonical: "/access" },
};

export default function AccessPage() {
  return <AccessClient />;
}
