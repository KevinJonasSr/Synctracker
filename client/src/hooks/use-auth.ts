// Temporarily bypass auth for deployment testing
// Returns a mock authenticated user

export function useAuth() {
  return {
    user: {
      id: "temp-user",
      email: "user@example.com",
      firstName: "Demo",
      lastName: "User",
      imageUrl: null,
    },
    isLoading: false,
    isAuthenticated: true,
    logout: () => {},
    isLoggingOut: false,
  };
}
