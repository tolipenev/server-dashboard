"use client";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Chrome} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import {signIn} from "next-auth/react";
import Image from "next/image";
import {useState} from "react";

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      await signIn("google", {callbackUrl: "/"});
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, ease: "easeOut"}}
        className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-6">
            <motion.div
              initial={{scale: 0.8, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              transition={{delay: 0.2, duration: 0.4}}
              className="mx-auto">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border">
                <Image
                  src="/home_server_favicon.png"
                  alt="App Logo"
                  className="w-16 h-16"
                  width={32}
                  height={32}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.3, duration: 0.4}}>
              <CardTitle className="text-3xl font-bold text-balance">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Sign in to your account to continue
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              whileHover={{y: -1}}
              whileTap={{scale: 0.98}}
              transition={{type: "spring", stiffness: 400, damping: 25}}>
              <Button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                variant="outline"
                className="w-full h-12 gap-3 bg-transparent cursor-pointer">
                <AnimatePresence mode="wait">
                  {isGoogleLoading ? (
                    <motion.div
                      key="loading"
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{duration: 0.2}}
                      className="flex items-center gap-3">
                      <motion.div
                        animate={{rotate: 360}}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full"
                      />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{duration: 0.2}}
                      className="flex items-center gap-3">
                      <Chrome className="w-5 h-5" />
                      <span>Continue with Google</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.5, duration: 0.4}}
              className="text-center">
              <p className="text-xs text-muted-foreground">
                Secured with industry-standard encryption
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
