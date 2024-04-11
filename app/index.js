import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { colors } from "../src/constants/colors";
import { generateOtp } from "../src/utils/getOtp";
import TOtpAppType from "../src/types/TOtpApp";

const HomeHeader = () => (
  <View style={{ paddingHorizontal: 16 }}>
    <Text style={{ fontSize: 24, fontWeight: "700" }}>Authenticator</Text>
    <Text style={{ fontSize: 16 }}>Here you can manage your 2FA apps</Text>
  </View>
);

function EmptyHome() {
  const router = useRouter();

  const onAddPressed = () => {
    router.navigate("/add");
  };
  return (
    <View style={{ flex: 1, paddingVertical: 16 }}>
      <HomeHeader />
      <View style={emptyHomeStyles.container}>
        <View style={emptyHomeStyles.actionContainer}>
          <Text style={emptyHomeStyles.title}>Let's add your first App</Text>
          <Pressable onPress={onAddPressed} style={emptyHomeStyles.button}>
            <Text style={{ fontSize: 16, color: colors.light }}>
              <MaterialCommunityIcon
                name={"plus"}
                size={18}
                color={colors.light}
              />{" "}
              Add Account
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const emptyHomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: { gap: 12, display: "flex", alignItems: "center" },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.primaryBlack,
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: colors.primaryBlack,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

const ProgressBar = ({
  current,
  max: _max,
}: {
  current: number;
  max: number;
}) => {
  const max = _max / 100;
  return (
    <View
      style={{
        width: `${current / max}%`,
        height: 4,
        backgroundColor: colors.primaryGreen,
      }}
    />
  );
};

export default function Home() {
  const router = useRouter();
  const { isFocused } = useNavigation();
  const [data, setData] = useState<Array<TOtpAppType>>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const generateOtps = (data: Array<TOtpAppType>) => {
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
      const content = await SecureStore.getItemAsync("data", {
        requireAuthentication: true,
        authenticationPrompt: "Please Unlock",
      });
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

  const onAddPressed = () => {
    router.navigate("/add");
  };

  if (data.length === 0) return <EmptyHome />;

  return (
    <>
      <ProgressBar current={timeRemaining} max={30} />
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
              <Pressable style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={styles.usernameText}>{item.username}</Text>
                <Text style={styles.issuerText}>{item.issuer}</Text>
                <Text style={styles.otpText}>
                  {item.otp.slice(0, 3) + " " + item.otp.slice(3, 6)}
                </Text>
              </Pressable>
            );
          }}
        />

        <Pressable style={styles.button} onPress={onAddPressed}>
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
  usernameText: {
    color: colors.primaryBlack,
    fontSize: 20,
    fontWeight: "600",
  },
  issuerText: { color: colors.grey01, fontSize: 14 },
  otpText: {
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 2,
    color: colors.primaryGreen,
  },
});
