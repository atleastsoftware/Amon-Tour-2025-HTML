import fs from "fs";
import path from "path";
import { db } from "./db";
import { tours } from "@shared/schema";
import { log } from "./vite";
import { eq } from "drizzle-orm";

// Function to migrate tours from JSON file to database
export async function migrateTours() {
  try {
    const dataPath = path.join(process.cwd(), "data");
    const toursPath = path.join(dataPath, "tours.json");
    
    // Check if JSON file exists
    if (!fs.existsSync(toursPath)) {
      log("Tours JSON file not found. Skipping tour migration.");
      return;
    }
    
    // Read tours from JSON file
    const data = fs.readFileSync(toursPath, 'utf8');
    const toursData = JSON.parse(data);
    
    if (!Array.isArray(toursData) || toursData.length === 0) {
      log("No tours found in JSON file. Skipping tour migration.");
      return;
    }
    
    // Check if we already have tours in the database
    const existingTours = await db.select().from(tours);
    if (existingTours.length > 0) {
      log("Tours already exist in database. Skipping tour migration.");
      return;
    }
    
    log(`Migrating ${toursData.length} tours from JSON to database...`);
    
    // Insert all tours
    for (const tour of toursData) {
      // Check if tour already exists
      const [existingTour] = await db.select().from(tours).where(eq(tours.id, tour.id));
      
      if (!existingTour) {
        await db.insert(tours).values({
          id: tour.id,
          title: tour.title,
          shortDescription: tour.shortDescription,
          description: tour.description,
          duration: tour.duration,
          price: tour.price,
          imageUrl: tour.imageUrl,
          tourNinjaUrl: tour.tourNinjaUrl,
          featured: tour.featured || false
        });
        log(`Migrated tour: ${tour.title}`);
      }
    }
    
    log("Tour migration completed successfully");
  } catch (error) {
    log(`Error migrating tours: ${error}`);
  }
}