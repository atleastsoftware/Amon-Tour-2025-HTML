import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tours from "@/pages/tours";
import Stays from "@/pages/stays";
import TourDetails from "@/pages/tour-details";
import CustomTour from "@/pages/custom-tour";
import BookTour from "@/pages/book-tour";
import PaymentComplete from "@/pages/payment-complete";
import Login from "@/pages/admin/login";
import Dashboard from "@/pages/admin/dashboard";
import TourForm from "@/pages/admin/tour-form";
import AvailabilityManager from "@/pages/admin/availability-manager";
import ReservationsManager from "@/pages/admin/reservations-manager";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/stays" component={Stays} />
      <Route path="/tours/:id" component={TourDetails} />
      <Route path="/custom-tour" component={CustomTour} />
      <Route path="/book-tour/:id" component={BookTour} />
      <Route path="/payment-complete" component={PaymentComplete} />
      
      {/* Admin Pages */}
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/tour-form" component={TourForm} />
      <Route path="/admin/availability-manager" component={AvailabilityManager} />
      <Route path="/admin/reservations-manager" component={ReservationsManager} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <WhatsAppButton />
    </TooltipProvider>
  );
}

export default App;
