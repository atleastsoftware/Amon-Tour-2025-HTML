import { Home, FileText, FormInput, Calendar, DollarSign, Image, Video, List, Search, Mail } from 'lucide-react';

export interface BlockPreviewDefinition {
  type: string;
  label: string;
  preview: JSX.Element;
  miniPreview?: JSX.Element;
}

// Full-size previews for BlockSelectionPopup
export const getFullBlockPreviews = (): Record<string, BlockPreviewDefinition> => ({
  hero: {
    type: 'hero',
    label: 'Hero Section',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-48 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-lg font-bold mb-1 text-center">Titre principal</h1>
            <p className="text-xs opacity-90 mb-2 text-center">Sous-titre</p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white text-[#084F6E] rounded text-xs font-semibold">
                Bouton 1
              </div>
              <div className="px-3 py-1 border border-white rounded text-xs font-semibold">
                Bouton 2
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
            <h1 className="text-sm font-bold mb-1 text-center">Titre principal</h1>
            <p className="text-xs opacity-90 mb-1.5 text-center">Sous-titre</p>
            <div className="flex gap-1.5">
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
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
            <h1 className="text-base font-bold mb-0.5 text-center">Titre de la page</h1>
            <p className="text-xs opacity-90 text-center">Sous-titre</p>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-24 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
            <h1 className="text-sm font-bold mb-0.5 text-center">Titre de la page</h1>
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#666666' }}>
            Ajoutez ici le contenu de votre section de texte.
          </p>
          <div className="flex gap-2 justify-center">
            <div className="px-3 py-1 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
            <div className="px-3 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Bouton 2</div>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
            Ajoutez ici le contenu de votre section de texte.
          </p>
          <div className="flex gap-1.5 justify-center">
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec badges de durée.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-1 right-1 bg-white px-1.5 py-0.5 rounded text-xs">1 jour</div>
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec badges de durée.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre du formulaire
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre formulaire personnalisé.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-24"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded"></div>
            <div className="h-6 bg-gray-100 rounded"></div>
            <div className="h-6 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre du formulaire
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre formulaire personnalisé.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-16"></div>
          <div className="space-y-1.5">
            <div className="h-5 bg-gray-100 rounded"></div>
            <div className="h-5 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },

  tour_ninja_section: {
    type: 'tour_ninja_section',
    label: 'Card Grid Price',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec prix.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-1 right-1 bg-white px-1.5 py-0.5 rounded text-xs">Prix</div>
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec prix.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre section avec icônes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded-lg p-3 bg-white">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-sm`}></i>
              </div>
              <div className="text-xs font-semibold mb-1">Titre</div>
              <div className="text-xs text-gray-500">Description</div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre section avec icônes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded p-2 bg-white">
              <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-xs`}></i>
              </div>
              <div className="text-xs font-semibold mb-0.5">Titre</div>
              <div className="text-xs text-gray-500">Description</div>
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <h2 className="font-bold text-base mb-2" style={{ color: '#333333' }}>
              Titre principal
            </h2>
            <div className="w-12 h-0.5 mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>
              Ajoutez ici votre contenu texte principal.
            </p>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#333333' }}>
              Sous-titre
            </h3>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
              Description supplémentaire pour votre section.
            </p>
            <div className="flex gap-2 mt-auto">
              <div className="px-3 py-1 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
              <div className="px-3 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Bouton 2</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-20 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
            <div className="h-20 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-20 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-20 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
              Titre principal
            </h2>
            <div className="w-10 h-0.5 mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
              Ajoutez ici votre contenu texte principal.
            </p>
            <h3 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
              Sous-titre
            </h3>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
              Description supplémentaire pour votre section.
            </p>
            <div className="flex gap-1.5 mt-auto">
              <div className="px-2 py-0.5 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
              <div className="px-2 py-0.5 border border-[#084F6E] text-[#084F6E] rounded text-xs">Bouton 2</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
            <div className="h-12 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-12 bg-gradient-to-r from-[#3BA8AF] to-[#084F6E] rounded"></div>
            <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
          </div>
        </div>
      </div>
    )
  },

  search_bar_tours: {
    type: 'search_bar_tours',
    label: 'Search Bar: Tours',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Rechercher un tour
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-3 mb-3">
          <div className="text-sm text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-2">
                <div className="text-xs font-semibold">Tour {i}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Rechercher un tour
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-2 mb-2">
          <div className="text-xs text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-1.5">
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Contactez-nous
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-sm font-semibold mb-1" style={{ color: '#333333' }}>Email</div>
            <div className="text-xs text-gray-600">contact@email.com</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold mb-1" style={{ color: '#333333' }}>Téléphone</div>
            <div className="text-xs text-gray-600">+66 12 345 678</div>
          </div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Contactez-nous
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Rechercher un article
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-3 mb-3">
          <div className="text-sm text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-2">
                <div className="text-xs font-semibold">Article {i}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Rechercher un article
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
        </div>
        <div className="bg-gray-100 rounded p-2 mb-2">
          <div className="text-xs text-gray-500">🔍 Rechercher...</div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]"></div>
              <div className="p-1.5">
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec galerie d'images
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec galerie
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded"></div>
          ))}
        </div>
      </div>
    )
  },

  text_video: {
    type: 'text_video',
    label: 'Text + Video',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec vidéo
          </p>
        </div>
        <div className="aspect-video bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded flex items-center justify-center">
          <div className="text-white text-2xl">▶</div>
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec vidéo
          </p>
        </div>
        <div className="aspect-video bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded flex items-center justify-center">
          <div className="text-white text-lg">▶</div>
        </div>
      </div>
    )
  },

  text_listing: {
    type: 'text_listing',
    label: 'Text + Listing',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec liste
          </p>
        </div>
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3BA8AF]"></div>
              <div className="text-xs" style={{ color: '#666666' }}>Point de liste {i}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec liste
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
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec tarifs
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-3 text-center">
              <div className="text-sm font-bold mb-1" style={{ color: '#084F6E' }}>Plan {i}</div>
              <div className="text-xs text-gray-500 mb-2">Description</div>
              <div className="text-lg font-bold" style={{ color: '#3BA8AF' }}>$99</div>
            </div>
          ))}
        </div>
      </div>
    ),
    miniPreview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description avec tarifs
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded p-2 text-center">
              <div className="text-xs font-bold mb-0.5" style={{ color: '#084F6E' }}>Plan {i}</div>
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm font-bold" style={{ color: '#3BA8AF' }}>$99</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
});
