import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "click.uway.shuanglu",
  appName: "双陆",
  webDir: "dist",
  backgroundColor: "#2b1512",
  loggingBehavior: "debug",
  ios: {
    contentInset: "never",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
