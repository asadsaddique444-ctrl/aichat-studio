import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
  } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const principalId = identity?.getPrincipal().toString() ?? null;

  const displayName = principalId
    ? `${principalId.slice(0, 5)}...${principalId.slice(-3)}`
    : null;

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
    principalId,
    displayName,
    login: handleLogin,
    logout: handleLogout,
  };
}
