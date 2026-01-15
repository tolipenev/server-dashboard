"use client";

import {ServiceCard} from "@/components/custom/cards";
import type {Service} from "@/types/card";
import {Database, Globe, Radio, Server} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import {useEffect, useState} from "react";

const categorizeServices = (services: Service[]) => {
  const categories = {
    "Web Applications": [] as Service[],
    Databases: [] as Service[],
    Infrastructure: [] as Service[],
    "Other Services": [] as Service[],
  };

  services.forEach((service) => {
    const name = service.name.toLowerCase();
    const hasHref = service.href && service.href.trim() !== "";

    if (
      hasHref &&
      (name.includes("assistant") ||
        name.includes("cloud") ||
        name.includes("vault") ||
        name.includes("keycloak") ||
        name.includes("wallos") ||
        name.includes("zigbee") ||
        name.includes("fleet"))
    ) {
      categories["Web Applications"].push(service);
    } else if (
      name.includes("mysql") ||
      name.includes("postgres") ||
      name.includes("redis") ||
      name.includes("couchdb")
    ) {
      categories.Databases.push(service);
    } else if (name.includes("cloudflared") || name.includes("mosquitto")) {
      categories.Infrastructure.push(service);
    } else {
      categories["Other Services"].push(service);
    }
  });

  return categories;
};

const categoryIcons = {
  "Web Applications": Globe,
  Databases: Database,
  Infrastructure: Server,
  "Other Services": Radio,
};

export default function Home() {
  const [apps, setApps] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchApps = () => {
      fetch("/api/services")
        .then((res) => res.json())
        .then((data) => {
          setApps(data.services || []);
          setTokenExpiry(data.tokenExpiry);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchApps(); // initial load
    const interval = setInterval(fetchApps, 30 * 60 * 1000); // every 30 min
    return () => clearInterval(interval);
  }, []);

  // token countdown
  useEffect(() => {
    if (!tokenExpiry) return;
    const expiryDate = new Date(tokenExpiry);

    const updateCountdown = () => {
      const diff = expiryDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setTimeLeft(`${days} days left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60 * 60 * 1000); // update every hour
    return () => clearInterval(interval);
  }, [tokenExpiry]);

  // helper for date formatting
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(new Date(dateStr))
      .replace(/\s/g, "-");
  };
  const categorizedServices = categorizeServices(apps);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6}}
        className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-balance bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          Service Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Monitor and manage your home server services with real-time status
          updates
        </p>

        {/* ✅ token expiry shown once above all cards */}
        {tokenExpiry && (
          <p className="text-sm text-muted-foreground">
            ArgoCD token expires on{" "}
            <span className="font-medium">{formatDate(tokenExpiry)}</span> (
            {timeLeft})
          </p>
        )}

        {!loading && (
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>{apps.length} Total Services</span>
            <span>•</span>
            <span>
              {apps.filter((app) => app.href && app.href.trim() !== "").length}{" "}
              Web Apps
            </span>
            <span>•</span>
            <span>
              {apps.filter((app) => app.health.label === "Healthy").length}{" "}
              Healthy
            </span>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            className="flex items-center justify-center py-20"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}>
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0}}
            transition={{duration: 0.6, ease: "easeOut"}}
            className="space-y-12">
            {Object.entries(categorizedServices).map(
              ([category, services], categoryIndex) => {
                if (services.length === 0) return null;

                const CategoryIcon =
                  categoryIcons[category as keyof typeof categoryIcons];

                return (
                  <motion.section
                    key={category}
                    initial={{opacity: 0, y: 30}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: categoryIndex * 0.1}}
                    className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold">{category}</h2>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {services.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {services.map((app, index) => (
                        <motion.div
                          key={app.name}
                          initial={{opacity: 0, y: 20}}
                          animate={{opacity: 1, y: 0}}
                          transition={{
                            duration: 0.4,
                            delay: categoryIndex * 0.1 + index * 0.05,
                          }}>
                          <ServiceCard app={app} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                );
              },
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
