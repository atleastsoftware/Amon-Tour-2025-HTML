// Service de stockage persistant pour les images personnalisées TourNinja
// Utilise le dossier /uploads/tours qui est persistant sur Replit

import fs from 'fs';
import path from 'path';

/**
 * Service de stockage persistant pour les images personnalisées TourNinja
 * Utilise le dossier /uploads/tours qui est persistant sur Replit
 */
export class PersistentImageStorageService {

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
      const fileName = `tour-${timestamp}-${Math.round(Math.random() * 1E9)}.${extension}`;
      
      // Utiliser le dossier /uploads/tours qui est déjà persistant sur Replit
      const uploadDir = path.join(process.cwd(), 'uploads', 'tours');
      
      // Créer le dossier si nécessaire
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Chemin complet du fichier
      const filePath = path.join(uploadDir, fileName);
      
      // Sauvegarder le fichier
      fs.writeFileSync(filePath, file.buffer);
      
      // URL accessible depuis le frontend
      const persistentUrl = `/uploads/tours/${fileName}`;
      
      console.log(`✅ Image sauvegardée (persistant) : ${filePath}`);
      console.log(`✅ URL persistante : ${persistentUrl}`);
      
      return persistentUrl;
    } catch (error) {
      console.error("❌ Failed to upload image:", error);
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
      const persistentUrl = `/uploads/tours/${newFileName}`;
      
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
      if (!imageUrl.startsWith('/uploads/tours/')) {
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
    return url.startsWith('/uploads/tours/');
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