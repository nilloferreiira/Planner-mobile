import "@/styles/global.css";
import "@/utils/dayjsLocaleConfig";
import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { Loading } from "@/components/loading";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }
  return (
    <View className="flex-1 bg-zinc-950">
      <StatusBar
        barStyle={"light-content"}
        backgroundColor={"transparent"}
        translucent
      />
      <Slot />
    </View>
  );
}
