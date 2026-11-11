import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.andersonacademy.ctfl",
  appName: "Anderson Academy",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
