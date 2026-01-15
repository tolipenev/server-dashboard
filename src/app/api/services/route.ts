import https from "node:https";
import axios from "axios";
import { NextResponse } from "next/server";
import { resolveServiceMapping, resolveStatus } from "@/lib/mappings";

const TOKEN_EXPIRY_DAYS = 180;
export async function GET() {
  try {
    if (!process.env.ARGOCD_SERVER || !process.env.ARGOCD_TOKEN) {
      throw new Error("ARGOCD_SERVER or ARGOCD_TOKEN missing");
    }

    const agent = new https.Agent({ rejectUnauthorized: false });

    const res = await axios.get(
      `${process.env.ARGOCD_SERVER}/api/v1/applications`,
      {
        headers: { Authorization: `Bearer ${process.env.ARGOCD_TOKEN}` },
        httpsAgent: agent,
      },
    );

    const services = res.data.items.map((app: any) => {
      const rawName = app.metadata?.name || "unknown";
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const health = app.status?.health?.status || "unknown";
      const sync = app.status?.sync?.status || "unknown";

      const mapping = resolveServiceMapping(rawName);

      return {
        name,
        icon: mapping.icon,
        description: mapping.description,
        href: mapping.href || "",

        health: resolveStatus("health", health),
        sync: resolveStatus("sync", sync),
      };
    });

    const issuedAt = new Date();
    const expiryAt = new Date(
      issuedAt.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    return NextResponse.json({ services, tokenExpiry: expiryAt.toISOString() });
  } catch (err: any) {
    console.error("ArgoCD fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
