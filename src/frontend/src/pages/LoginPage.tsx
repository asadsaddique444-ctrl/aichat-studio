import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquare, Moon, Shield, Sparkles, Sun, Zap } from "lucide-react";
import { useEffect } from "react";
import { useDarkMode } from "../hooks/useDarkMode";

export function LoginPage() {
  const { login, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/chat" });
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: MessageSquare,
      label: "Intelligent Conversations",
      desc: "Context-aware AI that remembers your conversation history",
    },
    {
      icon: Zap,
      label: "Image Generation",
      desc: "Create stunning visuals from text descriptions in seconds",
    },
    {
      icon: Shield,
      label: "Privacy First",
      desc: "Your data lives on the Internet Computer — fully decentralized",
    },
  ];

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="login.page"
    >
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="font-display font-bold text-lg">Aura Chat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          data-ocid="login.theme_toggle"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Powered by Internet Computer
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight">
              Your AI assistant,{" "}
              <span className="text-accent">always available</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Chat, create images, upload files, and save every conversation —
              all secured by blockchain technology.
            </p>
            <div className="space-y-4 pt-2">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Use Internet Identity for secure, passwordless authentication.
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={login}
                disabled={isInitializing || isLoggingIn}
                className="w-full h-12 text-base font-semibold gap-2"
                data-ocid="login.submit_button"
              >
                <Shield className="w-4 h-4" />
                {isInitializing
                  ? "Loading..."
                  : isLoggingIn
                    ? "Authenticating..."
                    : "Continue with Internet Identity"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                No password needed. Your identity is cryptographically secured.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                First time? You'll be prompted to create an Internet Identity
                anchor — a secure digital key that only you control.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 bg-muted/40 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
