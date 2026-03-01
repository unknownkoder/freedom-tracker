import { SplashScreen } from "expo-router";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { authState, user, getUserService } = useGlobalContext();
  const { loadUser } = getUserService();

  // Load user on mount
  useEffect(() => {
    if (authState === "LOADING" && !user) {
      loadUser();
    }
  }, []);

  // Hide splash when auth resolves
  useEffect(() => {
    if (authState !== "LOADING") {
      SplashScreen.hideAsync();
    }
  }, [authState]);

  return null;
}
