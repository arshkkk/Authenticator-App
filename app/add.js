import {
  Pressable,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

function extractSecretIssuerAndUsername(uri) {
  // Regular expression to match the URI format
  const uriRegex =
    /^otpauth:\/\/totp\/([^:]+):([^?]+)\?secret=([^&]+)&issuer=([^&]+)/;

  // Match the URI against the regex
  const match = uri.match(uriRegex);
  if (!match) {
    throw new Error("Invalid URI format");
  }

  // Extract username, secret, and issuer from the regex groups
  const username = match[2];
  const secret = match[3];
  const issuer = match[4];

  return { secret, issuer, username };
}

export default function AddApp() {
  const router = useRouter();
  const nav = useNavigation();
  const ref = useRef("");
  const [_, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  const goBack = () => {
    if (router.canGoBack()) {
      nav.goBack();
    }
  };

  const onQrCodeScanned = async (data) => {
    if (data) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        const { secret, issuer, username } =
          extractSecretIssuerAndUsername(data);
        const content = await SecureStore.getItemAsync("data");

        await SecureStore.setItemAsync(
          "data",
          JSON.stringify([
            ...(JSON.parse(content || "[]") || []),
            { secret, issuer, username },
          ]),
        );
        router.push("/");
      } catch (error) {
        if (data === ref.current) return;
        ref.current = data;
        console.error(error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      if (data === ref.current) return;
      ref.current = data;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.statusBar}>
        <Pressable onPress={goBack}>
          <MaterialCommunityIcon name={"arrow-left"} size={24} />
        </Pressable>
        <Text style={styles.statusBarText}>Scan QR</Text>
      </View>

      <CameraView
        onBarcodeScanned={(scanningResult) => {
          onQrCodeScanned(scanningResult?.data);
        }}
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"], interval: 100000 }}
      >
        <View
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderColor: "green",
              borderWidth: 4,
              width: Dimensions.get("window").width / 1.25,
              height: Dimensions.get("window").width / 1.8,
              backgroundColor: "transparent",
              zIndex: -1,
            }}
          ></View>
          <Text style={{ color: "#fff", fontSize: 18, marginTop: 8 }}>
            Place QR Code within green lines
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  statusBarText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    paddingRight: 12,
  },
  camera: {
    flex: 1,
  },
});
