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
import TourShowcase from "@/pages/tour-showcase";
import CustomTour from "@/pages/custom-tour";
import BookTour from "@/pages/book-tour";
import BookingIframe from "@/pages/booking-iframe";
import PaymentComplete from "@/pages/payment-complete";
import AdminLogin from "@/pages/admin-login";
import Admin from "@/pages/admin";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import TourCardBuilder from "@/pages/tour-card-builder";
import AdminKrabiCelebration from "@/pages/admin/krabi-celebration";
import AdminPartnershipRequests from "@/pages/admin/partnership-requests";
import AdminGroupRequests from "@/pages/admin/group-requests";
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
import AdminTourNinjaImages from "@/pages/admin-tour-ninja-images";
import AdminBulkImageUpload from "@/pages/admin-bulk-image-upload";
import AdminTranslation from "@/pages/admin-translation";
import AdminAppearance from "@/pages/admin-appearance";
import AdminPageEditor from "@/pages/admin-page-editor";
import AdminEditor from "@/pages/admin-editor";
import AdminEditorPage from "@/pages/admin-editor-page";
import AdminEditorArticle from "@/pages/admin-editor-article";
import AdminEditorForm from "@/pages/admin-editor-form";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { IframeProvider } from "@/contexts/IframeContext";
import IframeModal from "@/components/ui/IframeModal";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/tours" component={Tours} />
      <Route path="/experiences" component={Experiences} />
      <Route path="/tour-cards" component={TourCards} />
      <Route path="/stays" component={Stays} />
      <Route path="/tour/:token" component={TourShowcase} />
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
      <Route path="/admin/krabi-celebration" component={AdminKrabiCelebration} />
      <Route path="/admin/partnership-requests" component={AdminPartnershipRequests} />
      <Route path="/admin/group-requests" component={AdminGroupRequests} />
      <Route path="/admin-blog" component={AdminBlog} />
      <Route path="/admin-newsletter" component={AdminNewsletter} />
      <Route path="/admin-custom-tours" component={AdminCustomTours} />
      <Route path="/admin-tour-ninja-images" component={AdminTourNinjaImages} />
      <Route path="/admin-bulk-image-upload" component={AdminBulkImageUpload} />
      <Route path="/admin-translation" component={AdminTranslation} />
      <Route path="/admin-appearance" component={AdminAppearance} />
      <Route path="/admin-page-editor" component={AdminPageEditor} />
      <Route path="/admin-editor" component={AdminEditor} />
      <Route path="/admin-editor-page" component={AdminEditorPage} />
      <Route path="/admin-editor-article" component={AdminEditorArticle} />
      <Route path="/admin-editor-form" component={AdminEditorForm} />
      <Route path="/tour-card-builder" component={TourCardBuilder} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <IframeProvider>
        <Router />
        <WhatsAppButton />
        <IframeModal />
      </IframeProvider>
    </TooltipProvider>
  );
}

export default App;
