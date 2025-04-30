import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tours from "@/pages/tours";
import TourDetails from "@/pages/tour-details";
import CustomTour from "@/pages/custom-tour";
import Login from "@/pages/admin/login";
import Dashboard from "@/pages/admin/dashboard";
import TourForm from "@/pages/admin/tour-form";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/tours/:id" component={TourDetails} />
      <Route path="/custom-tour" component={CustomTour} />
      
      {/* Admin Pages */}
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/tour-form" component={TourForm} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
