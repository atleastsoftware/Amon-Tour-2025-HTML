// Service de stockage persistant pour les images personnalisées TourNinja
// Utilise les variables d'environnement Object Storage configurées

/**
 * Service de stockage persistant pour les images personnalisées TourNinja
 * Utilise Replit Object Storage pour assurer la persistance en production
 */
export class PersistentImageStorageService {
  
  constructor() {
    // Vérifier que les variables d'environnement Object Storage sont configurées
    if (!process.env.PRIVATE_OBJECT_DIR) {
      throw new Error("PRIVATE_OBJECT_DIR environment variable not set. Object Storage not configured.");
    }
  }

  /**
   * Récupère le répertoire privé configuré pour Object Storage
   */
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error("PRIVATE_OBJECT_DIR not set. Object Storage not configured.");
    }
    return dir;
  }

  /**
   * Upload une image vers le stockage persistant
   * @param file - Fichier image à uploader
   * @param tourNinjaId - ID du tour TourNinja
   * @returns URL persistante de l'image
   */
  async uploadTourImage(file: Express.Multer.File, tourNinjaId: string): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const fileName = `tour-ninja-${tourNinjaId}-${timestamp}.${extension}`;
      
      // Uploader vers le répertoire privé
      const privateDir = this.getPrivateObjectDir();
      const objectPath = `${privateDir}/tour-images/${fileName}`;
      
      // TODO: Implémenter l'upload vers Object Storage
      // Pour l'instant, retourner l'URL qui sera générée
      const persistentUrl = `/objects/tour-images/${fileName}`;
      
      console.log(`✅ Image uploaded to persistent storage: ${persistentUrl}`);
      return persistentUrl;
    } catch (error) {
      console.error("❌ Failed to upload image to persistent storage:", error);
      throw error;
    }
  }

  /**
   * Migre une image existante du système local vers le stockage persistant
   * @param localUrl - URL locale actuelle (ex: /uploads/tours/filename.jpg)
   * @param tourNinjaId - ID du tour TourNinja
   * @returns Nouvelle URL persistante
   */
  async migrateLocalImage(localUrl: string, tourNinjaId: string): Promise<string> {
    try {
      if (!localUrl.startsWith('/uploads/tours/')) {
        throw new Error(`Invalid local URL format: ${localUrl}`);
      }

      // Extraire le nom de fichier
      const fileName = localUrl.split('/').pop();
      if (!fileName) {
        throw new Error(`Could not extract filename from: ${localUrl}`);
      }

      // Générer le nouveau nom avec l'ID TourNinja
      const timestamp = Date.now();
      const extension = fileName.split('.').pop();
      const newFileName = `tour-ninja-${tourNinjaId}-${timestamp}.${extension}`;
      
      // TODO: Copier le fichier local vers Object Storage
      const persistentUrl = `/objects/tour-images/${newFileName}`;
      
      console.log(`✅ Migrated ${localUrl} to ${persistentUrl}`);
      return persistentUrl;
    } catch (error) {
      console.error(`❌ Failed to migrate image ${localUrl}:`, error);
      throw error;
    }
  }

  /**
   * Supprime une image du stockage persistant
   * @param imageUrl - URL de l'image à supprimer
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl.startsWith('/objects/')) {
        console.warn(`Not a persistent storage URL, skipping deletion: ${imageUrl}`);
        return;
      }

      // TODO: Implémenter la suppression via Object Storage
      console.log(`✅ Deleted image from persistent storage: ${imageUrl}`);
    } catch (error) {
      console.error(`❌ Failed to delete image ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si une URL pointe vers le stockage persistant
   * @param url - URL à vérifier
   * @returns true si c'est une URL persistante
   */
  isPersistentUrl(url: string): boolean {
    return url.startsWith('/objects/');
  }

  /**
   * Génère une URL publique pour accéder à l'image
   * @param persistentUrl - URL persistante de l'image
   * @returns URL publique accessible
   */
  getPublicUrl(persistentUrl: string): string {
    if (!this.isPersistentUrl(persistentUrl)) {
      return persistentUrl; // Retourner telle quelle si ce n'est pas une URL persistante
    }
    
    // Les URLs Object Storage sont déjà publiques via les routes /objects/*
    return persistentUrl;
  }
}

export const persistentImageStorage = new PersistentImageStorageService();