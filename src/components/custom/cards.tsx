"use client";

import { ExternalLink, Info } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLucideIcon } from "@/lib/mappings";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/card";

export function ServiceCard({ app }: { app: Service }) {
  const Icon = getLucideIcon(app.icon);
  const isClickable = app.href && app.href.trim() !== "";

  const renderStatus = (status: any) => {
    const StatusIcon = getLucideIcon(status.icon);
    return (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded-full shadow-sm transition-colors",
            status.color,
          )}
        >
          <StatusIcon className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {status.label}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02, y: -2 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full"
    >
      <Card
        onClick={() => isClickable && window.open(app.href, "_blank")}
        className={cn(
          "flex flex-col h-full min-h-[260px] group relative overflow-hidden border-2 transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/10",
          isClickable
            ? "cursor-pointer border-border hover:border-primary/30 bg-card"
            : "border-muted bg-muted/50",
        )}
      >
        {isClickable && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isClickable
                      ? "bg-primary/10 text-primary group-hover:bg-primary/20"
                      : "bg-muted-foreground/10 text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold text-balance">
                  {app.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {isClickable ? (
                    <Badge variant="secondary" className="text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Web App
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Info className="w-3 h-3 mr-1" />
                      Service
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {app.description && (
          <CardDescription className="px-6 pb-4 text-sm text-pretty leading-relaxed flex-grow">
            {app.description}
          </CardDescription>
        )}

        <CardFooter className="pt-4 border-t bg-muted/30 relative z-10 mt-auto">
          <div className="flex justify-between items-center w-full">
            {renderStatus(app.health)}
            {renderStatus(app.sync)}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
