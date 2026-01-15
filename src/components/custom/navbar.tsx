"use client";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {LogOut, Server} from "lucide-react";
import {motion} from "motion/react";
import {signOut, useSession} from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const {data: session} = useSession();

  return (
    <motion.nav
      initial={{y: -20, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      transition={{duration: 0.5, ease: "easeOut"}}
      className="w-full">
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm group-hover:blur-md transition-all" />
              <div className="relative bg-primary/10 p-2 rounded-full border border-primary/20">
                <Server className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              {/* <h1 className="text-lg font-bold text-foreground">Home Server</h1> */}
              {/* <p className="text-xs text-muted-foreground">Dashboard</p> */}
            </div>
          </Link>

          {session?.user?.name && (
            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">
                Welcome back,{" "}
                <span className="font-medium text-foreground">
                  {session.user.name}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-border shadow-sm">
            <AvatarImage
              src={session?.user?.image || "/fallback-avatar.png"}
              alt="User Avatar"
              className="object-cover"
            />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
