import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/layout/Header";
import { NotesApp } from "./components/notes/NotesApp";
import { OfflineBanner } from "./components/ui/ErrorState";
import { useOnlineStatus } from "./hooks/useDebounce";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

function AppContent() {
  const isOnline = useOnlineStatus();

  return (
    <>
      {!isOnline && <OfflineBanner />}
      <Header />
      <NotesApp isOffline={!isOnline} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
