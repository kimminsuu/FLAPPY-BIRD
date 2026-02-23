import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flappybird.app",
  appName: "Flappy Bird",
  webDir: "out",
  plugins: {
    SystemBars: {
      hidden: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      splashImmersive: true,
      splashFullScreen: true,
    },
  },
};

export default config;
