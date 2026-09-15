import { Helmet } from "react-helmet";
import { useTourNinjaRelease } from "@/contexts/TourNinjaReleaseContext";

/** Keeps a session-only draft preview out of search even on legacy pages that
 * still set their own Helmet metadata. */
export default function TourNinjaReleaseMeta() {
  const { isPreview } = useTourNinjaRelease();
  if (!isPreview) return null;
  const exitPreview = () => {
    sessionStorage.removeItem("tour-ninja-release-preview");
    sessionStorage.removeItem("tour-ninja-release-preview-digest");
    window.location.reload();
  };
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Helmet>
      <div className="fixed bottom-3 left-3 z-[100] rounded bg-slate-900 px-3 py-2 text-sm text-white shadow-lg">
        Tour Ninja draft preview
        <button type="button" onClick={exitPreview} className="ml-3 underline">
          Exit
        </button>
      </div>
    </>
  );
}