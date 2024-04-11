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
import extractDataFromTOtpUri from "../src/utils/extractDataFromTOtpUri";

export default function AddApp() {
  const router = useRouter();
  const nav = useNavigation();
  const [_, requestPermission] = useCameraPermissions();
  const processingRef = useRef({ lastGarbageData: [], isProcessing: false });

  useEffect(() => {
    requestPermission();
  }, []);

  const goBack = () => {
    if (router.canGoBack()) {
      nav.goBack();
    }
  };

  const onQrCodeParsingError = (data: string) => {
    if (processingRef.current.lastGarbageData.includes(data)) return;
    processingRef.current.lastGarbageData.push(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const onQrCodeScanned = async (data: string) => {
    if (processingRef.current.isProcessing) return;
    processingRef.current.isProcessing = true;
    if (data) {
      try {
        const { secret, issuer, username } = extractDataFromTOtpUri(data);
        const content = await SecureStore.getItemAsync("data");
        console.log({ content });
        const parsedData = JSON.parse(content || "[]") || [];

        // only add when secret is not added
        if (
          parsedData.findIndex(
            (d: { secret: string }) => d.secret === secret,
          ) === -1
        ) {
          await SecureStore.setItemAsync(
            "data",
            JSON.stringify([...parsedData, { secret, issuer, username }]),
            {
              requireAuthentication: true,
              authenticationPrompt:
                "Let's secure your OTP with your biometrics",
            },
          );
        }
        console.log("here");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        processingRef.current.isProcessing = false;
        router.navigate("/");
      } catch (error) {
        onQrCodeParsingError(data);
      }
    } else {
      onQrCodeParsingError(data);
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
        barcodeScannerSettings={{ barcodeTypes: ["qr"], interval: 1000 }}
      >
        <View style={styles.cameraBorderContainer}>
          <View style={styles.cameraBorder}></View>
          <Text style={styles.cameraText}>
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
  cameraBorder: {
    borderColor: "green",
    borderWidth: 4,
    width: Dimensions.get("window").width / 1.25,
    height: Dimensions.get("window").width / 1.8,
    backgroundColor: "transparent",
    zIndex: -1,
  },
  cameraText: { color: "#fff", fontSize: 18, marginTop: 8 },
  cameraBorderContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
