import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import Landing from "@/pages/landing";
import FarmerRegister from "@/pages/farmer-register";
import FactoryDashboard from "@/pages/factory";
import AdminDashboard from "@/pages/admin";
import Backbone from "@/pages/backbone";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/farmer-register" component={FarmerRegister} />
      <Route path="/factory" component={FactoryDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/backbone" component={Backbone} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);

  useEffect(() => {
    // Check if user has visited before in this session
    const visited = sessionStorage.getItem('pa_visited');
    if (visited) {
      setShowLoading(false);
      setHasLoadedBefore(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('pa_visited', 'true');
    setShowLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <LanguageProvider>
            {showLoading && !hasLoadedBefore && (
              <LoadingScreen onComplete={handleLoadingComplete} />
            )}
            <Toaster />
            <Router />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

