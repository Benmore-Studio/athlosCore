module.exports = {
  expo: {
    name: "athlosCore",
    slug: "athlosCore",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "athloscore",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    
    // ✅ iOS Configuration (You already have this)
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jhaqq1.athlosCore",
      associatedDomains: [
        "applinks:athloscore.app",
        "applinks:www.athloscore.app"
      ],
      requireFullScreen: false,
      infoPlist: {
        NSAppTransportSecurity: {
          // ✅ DEVELOPMENT ONLY: Allow all connections including self-signed HTTPS
          // ⚠️ Remove NSExceptionDomains - they override the global setting
          NSAllowsArbitraryLoads: true,
        }
      }
    },
    
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || "https://athloscore.someexamplesof.ai/api/v1/public",
      useMockData: process.env.USE_MOCK_DATA === "true",
      allowSelfSignedCertificates: process.env.NODE_ENV !== "production",
      sslVerify: process.env.NODE_ENV === "production",
    },
    
    // ✅ Android Configuration (You already have this)
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.jhaqq1.athlosCore",
      supportsTablet: true,
      screenOrientation: "sensor",
      usesCleartextTraffic: true, // ✅ This is key for Android
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "athloscore.app",
              pathPrefix: "/"
            },
            {
              scheme: "https",
              host: "www.athloscore.app",
              pathPrefix: "/"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    
    plugins: [
      "expo-router",
      "expo-dev-client",
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
      ],
      [
        "expo-screen-orientation",
        {
          initialOrientation: "DEFAULT"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          },
          android: {
            usesCleartextTraffic: true,
            // ✅ ADD: Custom network security config
            networkSecurityConfig: "./network_security_config.xml"
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