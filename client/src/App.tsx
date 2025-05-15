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
import AdminLogin from "@/pages/admin-login";
import Admin from "@/pages/admin";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

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
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      
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
