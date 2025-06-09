import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tours from "@/pages/tours";
import Experiences from "@/pages/experiences";
import TourCards from "@/pages/tour-cards";
import Stays from "@/pages/stays";
import TourDetails from "@/pages/tour-details";
import TourView from "@/pages/tour-view";
import CustomTour from "@/pages/custom-tour";
import BookTour from "@/pages/book-tour";
import BookingIframe from "@/pages/booking-iframe";
import PaymentComplete from "@/pages/payment-complete";
import AdminLogin from "@/pages/admin-login";
import Admin from "@/pages/admin";
import TourCardBuilder from "@/pages/tour-card-builder";
import LegalNotice from "@/pages/legal-notice";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import ExternalStays from "@/pages/external-stays";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/experiences" component={Experiences} />
      <Route path="/tour-cards" component={TourCards} />
      <Route path="/stays" component={Stays} />
      <Route path="/tours/:id" component={TourDetails} />
      <Route path="/custom-tour" component={CustomTour} />
      <Route path="/book-tour/:id" component={BookTour} />
      <Route path="/booking" component={BookingIframe} />
      <Route path="/tour-view" component={TourView} />
      <Route path="/payment-complete" component={PaymentComplete} />
      <Route path="/external-stays" component={ExternalStays} />
      
      {/* Legal Pages */}
      <Route path="/legal-notice" component={LegalNotice} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      
      {/* Admin Pages */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/tour-card-builder" component={TourCardBuilder} />
      
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
