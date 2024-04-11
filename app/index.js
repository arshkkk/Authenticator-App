import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { colors } from "../src/colors";
import { generateOtp } from "../src/getOtp";

export default function Home() {
  const router = useRouter();
  const { isFocused } = useNavigation();
  const [data, setData] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const generateOtps = (data) => {
    if (data.length === 0) return;
    setData(
      data.map(({ secret, ...rest }) => ({
        ...rest,
        secret,
        otp: generateOtp(secret),
      })),
    );
  };

  useEffect(() => {
    (async () => {
      // await SecureStore.deleteItemAsync("data");
      const content = await SecureStore.getItemAsync("data");

      generateOtps(JSON.parse(content || "[]"));
    })();
  }, [isFocused()]);

  useEffect(() => {
    const timeout = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const nextCounter = Math.ceil(now / 30);
      const timeRemaining = nextCounter * 30 - now;
      if (timeRemaining === 0) {
        generateOtps(data);
      }
      setTimeRemaining(timeRemaining);
    }, 1000);
    return () => clearInterval(timeout);
  }, []);

  return (
    <>
      <View
        style={{
          width: `${timeRemaining / 0.3}%`,
          height: 4,
          backgroundColor: colors.primaryGreen,
        }}
      />
      <View
        style={{ paddingVertical: 16, position: "relative", flex: 1, gap: 18 }}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "700" }}>Authenticator</Text>
          <Text style={{ fontSize: 16 }}>
            Here you can manage your 2FA apps
          </Text>
          <Text style={{ color: colors.redYellow, marginTop: 6 }}>
            OTPs will be re-generated in {timeRemaining} seconds
          </Text>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={data}
          keyExtractor={(item, index) => item.username + index}
          ItemSeparatorComponent={() => (
            <View
              style={{
                backgroundColor: "#ddd",
                height: 1,
                marginHorizontal: 16,
              }}
            />
          )}
          renderItem={({ item }) => {
            return (
              <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text
                  style={{
                    color: colors.primaryBlack,
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                >
                  {item.username}
                </Text>
                <Text style={{ color: colors.grey01, fontSize: 14 }}>
                  {item.issuer}
                </Text>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "600",
                    letterSpacing: 2,
                    color: colors.primaryGreen,
                  }}
                >
                  {item.otp.slice(0, 3) + " " + item.otp.slice(3, 6)}
                </Text>
              </View>
            );
          }}
        />

        <Pressable
          android_ripple={{
            borderless: false,
            color: "#E7E7E7",
          }}
          style={styles.button}
          onPress={() => {
            router.push("/add");
          }}
        >
          <MaterialCommunityIcon name={"plus"} size={36} color={colors.light} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: "#ddd",
    borderRadius: 100,
    padding: 8,
    position: "absolute",
    bottom: 36,
    right: 24,
    borderWidth: 1,
    zIndex: 100,
    backgroundColor: colors.primaryBlack,
  },
});
