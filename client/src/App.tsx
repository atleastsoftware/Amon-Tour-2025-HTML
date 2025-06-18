import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tours from "@/pages/tours";
import Experiences from "@/pages/experiences";
import TourCards from "@/pages/tour-cards";
import Stays from "@/pages/stays";
import TourIframe from "@/pages/tour-iframe";
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
import KrabiCelebration from "@/pages/krabi-celebration";
import BecomePartner from "@/pages/become-partner";
import GroupCorporate from "@/pages/group-corporate";
import Brochure from "@/pages/brochure";
import VillasKrabi from "@/pages/villas-krabi";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import AdminBlog from "@/pages/admin-blog";
import AdminNewsletter from "@/pages/admin-newsletter";
import AdminCustomTours from "@/pages/admin-custom-tours";
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
      <Route path="/tour/:id" component={TourIframe} />
      <Route path="/custom-tour" component={CustomTour} />
      <Route path="/book-tour/:id" component={BookTour} />
      <Route path="/booking" component={BookingIframe} />
      <Route path="/tour-view" component={TourView} />
      <Route path="/payment-complete" component={PaymentComplete} />
      <Route path="/external-stays" component={ExternalStays} />
      
      {/* New Pages */}
      <Route path="/krabi-celebration" component={KrabiCelebration} />
      <Route path="/become-partner" component={BecomePartner} />
      <Route path="/group-corporate" component={GroupCorporate} />
      <Route path="/brochure" component={Brochure} />
      <Route path="/villas-krabi" component={VillasKrabi} />
      <Route path="/contact" component={Contact} />
      
      {/* Blog Pages */}
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      
      {/* Legal Pages */}
      <Route path="/legal-notice" component={LegalNotice} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      
      {/* Admin Pages */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin-blog" component={AdminBlog} />
      <Route path="/admin-newsletter" component={AdminNewsletter} />
      <Route path="/admin-custom-tours" component={AdminCustomTours} />
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
