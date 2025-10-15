import { Images, Video } from 'lucide-react';

export interface BlockPreview {
  type: string;
  label: string;
  preview: JSX.Element;
}

export const getMiniBlockPreviews = (): Record<string, BlockPreview> => ({
  hero: {
    type: 'hero',
    label: 'Hero Section',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-20 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
            <h1 className="text-xs font-bold mb-0.5 text-center">Titre principal</h1>
            <p className="text-xs opacity-90 mb-1 text-center">Sous-titre</p>
            <div className="flex gap-1">
              <div className="px-2 py-0.5 bg-white text-[#084F6E] rounded text-xs font-semibold">
                Bouton 1
              </div>
              <div className="px-2 py-0.5 border border-white rounded text-xs font-semibold">
                Bouton 2
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  header_page: {
    type: 'header_page',
    label: 'Header Page',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
            <h1 className="text-xs font-bold mb-0.5 text-center">Titre de la page</h1>
            <p className="text-xs opacity-90 text-center">Sous-titre</p>
          </div>
        </div>
      </div>
    )
  },

  text: {
    type: 'text',
    label: 'Text + Buttons',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
            Ajoutez ici le contenu de votre section de texte.
          </p>
          <div className="flex gap-1 justify-center">
            <div className="px-2 py-0.5 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
            <div className="px-2 py-0.5 border border-[#084F6E] text-[#084F6E] rounded text-xs">Bouton 2</div>
          </div>
        </div>
      </div>
    )
  },

  popular_experiences: {
    type: 'popular_experiences',
    label: 'Card Grid Date',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec badges de durée.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-0.5 right-0.5 bg-white px-1 py-0.5 rounded text-xs">1 jour</div>
              </div>
              <div className="p-1.5 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  custom_tour_form: {
    type: 'custom_tour_form',
    label: 'Form',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre du formulaire
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre formulaire personnalisé.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-14"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },

  tour_ninja_section: {
    type: 'tour_ninja_section',
    label: 'Card Grid Price',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec prix.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-0.5 right-0.5 bg-white px-1 py-0.5 rounded text-xs">Prix</div>
              </div>
              <div className="p-1.5 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  why_choose_us: {
    type: 'why_choose_us',
    label: 'Text + Icones',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre section avec icônes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded p-1.5 bg-white">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-xs`}></i>
              </div>
              <div className="text-xs font-semibold">Titre</div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  who_we_are: {
    type: 'who_we_are',
    label: 'Text + Images',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
              Titre principal
            </h2>
            <div className="w-6 h-0.5 mb-1" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-1.5" style={{ color: '#666666' }}>
              Ajoutez ici votre contenu texte principal.
            </p>
            <div className="flex gap-1 mt-auto">
              <div className="px-2 py-0.5 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-10 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
            <div className="h-10 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-10 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-10 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
          </div>
        </div>
      </div>
    )
  },

  search_bar_tours: {
    type: 'search_bar_tours',
    label: 'Search Bar: Tours',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Rechercher un tour
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-1.5 mb-2">
          <div className="text-xs text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-10 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-1">
                <div className="text-xs font-semibold">Tour {i}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  contact: {
    type: 'contact',
    label: 'Contact',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Contactez-nous
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xs font-semibold mb-0.5" style={{ color: '#333333' }}>Email</div>
            <div className="text-xs text-gray-600">contact@email.com</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold mb-0.5" style={{ color: '#333333' }}>Téléphone</div>
            <div className="text-xs text-gray-600">+66 12 345 678</div>
          </div>
        </div>
      </div>
    )
  },

  blog_search: {
    type: 'blog_search',
    label: 'Search Bar: Blog',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Rechercher un article
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-1.5 mb-2">
          <div className="text-xs text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-10 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-1">
                <div className="text-xs font-semibold">Article {i}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  text_gallery: {
    type: 'text_gallery',
    label: 'Text + Gallery',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la galerie
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description pour votre galerie d'images
          </p>
        </div>
        <div className="flex gap-1 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded shadow-md flex items-center justify-center">
              <Images className="w-4 h-4 text-white opacity-60" />
            </div>
          ))}
        </div>
      </div>
    )
  },

  text_video: {
    type: 'text_video',
    label: 'Text + Video',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la vidéo
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#084F6E' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description pour votre section vidéo
          </p>
        </div>
        <div className="aspect-video bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded flex items-center justify-center">
          <Video className="w-6 h-6 text-white opacity-60" />
        </div>
      </div>
    )
  },

  text_listing: {
    type: 'text_listing',
    label: 'Text + Listing',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la liste
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description pour votre section de liste
          </p>
        </div>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#3BA8AF]"></div>
              <div className="text-xs" style={{ color: '#666666' }}>Point de liste {i}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  text_pricing: {
    type: 'text_pricing',
    label: 'Text + Pricing',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-3">
        <div className="text-center mb-2">
          <h2 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-8 h-0.5 mx-auto mb-1.5" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec tarifs
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded p-1.5 text-center">
              <div className="text-xs font-bold mb-0.5" style={{ color: '#084F6E' }}>Plan {i}</div>
              <div className="text-xs text-gray-500">$99</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
});
