/**
 * DESIGN: أطلس السيلولويد — غلاف تطبيق داكن يقدّم مسارات الاكتشاف والبحث والمشاهدة بلا طبقات غير لازمة.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import DiscoverPage from "@/pages/DiscoverPage";
import DetailPage from "@/pages/DetailPage";
import SearchPage from "@/pages/SearchPage";
import WatchPage from "@/pages/WatchPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Home from "./pages/Home";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/discover/:mode"} component={DiscoverPage} />
      <Route path={"/discover"} component={DiscoverPage} />
      <Route path={"/title/:kind/:id"} component={DetailPage} />
      <Route path={"/watch/:kind/:id"} component={WatchPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;
