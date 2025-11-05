module.exports = {
  expo: {
    name: "athlosCore",
    slug: "athlosCore",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "athloscore",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jhaqq1.athlosCore"
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || "https://your-api.com",
      useMockData: process.env.USE_MOCK_DATA === "true"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};