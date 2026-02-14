import { useUser, useClerk } from "@clerk/clerk-react";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    } : null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    logout: () => signOut(),
    isLoggingOut: false,
  };
}
