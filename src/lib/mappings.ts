import * as Icons from "lucide-react";

// Normalize names before lookup
function normalizeKey(name: string) {
  return name.toLowerCase().replace(/[-_]/g, "");
}

function withBase(path?: string) {
  if (!path) return undefined;

  // Allow absolute URLs (e.g. cloud domain) without modification
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = process.env.NEXT_PUBLIC_HOMESERVER_BASE_URL ?? "";
  if (!base) return path; // fallback: return relative path

  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const serviceMappings: Record<
  string,
  {icon: string; description: string; href?: string}
> = {
  cloudflared: {
    icon: "Cloud",
    description: "Secure tunnel for accessing services remotely.",
  },
  couchdb: {
    icon: "Database",
    description: "NoSQL document database. Used for Obsidian",
  },
  fleetdm: {
    icon: "Monitor",
    description: "Device management and security platform.",
    href: withBase(":30808"),
  },
  homeassistant: {
    icon: "Home",
    description: "Control smart devices and monitor sensors.",
    href: withBase(":8123/lovelace/home"),
  },
  keycloak: {
    icon: "UserCircle2",
    description: "Identity and access management for apps.",
    href: withBase(":30910"),
  },
  mosquitto: {
    icon: "Radio",
    description: "MQTT message broker for IoT devices.",
  },
  mysql: {
    icon: "Database",
    description: "Relational SQL database. Used for FleetDM",
  },
  owncloud: {
    icon: "Cloud",
    description: "Self-hosted file sharing and collaboration.",
    href: withBase(":30080"),
  },
  postgres: {
    icon: "Database",
    description: "Advanced relational SQL database.",
  },
  redis: {
    icon: "DatabaseZap",
    description: "In-memory key-value data store. Caching option.",
  },
  vaultwarden: {
    icon: "Lock",
    description: "Password manager server, Bitwarden compatible.",
    href: withBase(":30182"),
  },
  wallos: {
    icon: "Wallet",
    description: "Personal finance and subscription tracker.",
    href: withBase(":30681"),
  },
  zigbee2mqtt: {
    icon: "RadioTower",
    description: "Bridge Zigbee devices to MQTT for smart homes.",
    href: withBase(":31592"),
  },
};

// Resolver with fallback
export function resolveServiceMapping(name: string) {
  const key = normalizeKey(name);
  return (
    serviceMappings[key] || {
      icon: "Server",
      description: "No description available.",
    }
  );
}

// Mapping for API to send ready-to-render statuses
export function resolveStatus(type: "health" | "sync", status: string) {
  const normalized = status.toLowerCase();

  if (type === "health") {
    if (normalized === "healthy")
      return {icon: "Check", color: "bg-green-500", label: "Healthy"};
    if (normalized === "degraded")
      return {icon: "X", color: "bg-red-500", label: "Degraded"};
    return {icon: "AlertTriangle", color: "bg-yellow-500", label: "Unknown"};
  }

  if (normalized === "synced")
    return {icon: "RefreshCcw", color: "bg-blue-500", label: "Synced"};
  if (normalized === "outofsync")
    return {icon: "RefreshCcw", color: "bg-red-800", label: "Out of Sync"};
  return {icon: "HelpCircle", color: "bg-gray-500", label: "Unknown"};
}

export function getLucideIcon(name: string) {
  return (Icons[name as keyof typeof Icons] ||
    Icons.HelpCircle) as React.ComponentType<any>;
}
