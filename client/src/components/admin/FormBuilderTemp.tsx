import { useTranslation } from 'react-i18next';
// Backup temporaire pour récupérer la structure preview
{/* Full Width Preview */}
{
  showPreview && <div className="bg-gray-100 border-b">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
                {/* Image Side - Reproduction exacte du site */}
                <div className="h-64 md:h-auto relative">
                  {formData.headerImage ? <img src={formData.headerImage} alt={t("Headerimage", {
              defaultValue: "Headerimage"
            })} className="w-full h-full object-cover" onError={e => {
              e.currentTarget.src = '/catamaran-cruise.png';
            }} /> : <div className="w-full h-full bg-gray-200"></div>}
                  <div className="absolute inset-0 flex flex-col justify-center p-8" style={{
              background: `linear-gradient(to right, ${resolveColor(formData.primaryColor)}CC, transparent)`
            }}>
                    <h3 className="font-heading font-bold text-3xl mb-3" style={{
                color: resolveColor(formData.titleColor)
              }}>
                      {formData.title || 'Titre du formulaire'}
                    </h3>
                    <p className="max-w-xs" style={{
                color: resolveColor(formData.subtitleColor)
              }}>
                      {formData.subtitle || formData.description || 'Description du formulaire'}
                    </p>
                  </div>
                </div>
                
                {/* Form Side - Reproduction exacte du site */}
                <div className="p-8" style={{
            backgroundColor: resolveColor(formData.frameColor)
          }}>{t("Formcontenthere", {
              defaultValue: "Formcontenthere"
            })}</div>
              </div>
            </div>
          </div>
        </div>;
}