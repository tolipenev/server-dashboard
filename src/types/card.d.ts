export type Service = {
  name: string;
  icon: string;
  description: string;
  href: string;
  health: { icon: string; color: string; label: string };
  sync: { icon: string; color: string; label: string };
  tokenExpiry?: string; // optional
};
