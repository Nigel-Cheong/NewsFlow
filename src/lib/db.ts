
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Newsletter } from './types';
import { mockNewsletters } from './mock-data';

const dataDir = path.join(process.cwd(), 'data');

// Function to ensure the data directory and mock files exist
async function initializeData() {
  try {
    // Check if the directory exists, if not create it
    await fs.mkdir(dataDir, { recursive: true });

    // Check for each mock newsletter if its file exists, if not create it
    for (const newsletter of mockNewsletters) {
      const filePath = path.join(dataDir, `${newsletter.id}.json`);
      try {
        await fs.access(filePath); // Check if file exists
      } catch {
        // File doesn't exist, so write it
        await fs.writeFile(filePath, JSON.stringify(newsletter, null, 2), 'utf8');
        console.log(`Created mock newsletter file: ${newsletter.id}.json`);
      }
    }
  } catch (error) {
    console.error('Failed to initialize data directory or mock files:', error);
  }
}

// Call initialization on server start
initializeData();

export async function getAllNewsletters(): Promise<Newsletter[]> {
  try {
    const files = await fs.readdir(dataDir);
    const newsletterPromises = files
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        const filePath = path.join(dataDir, file);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data) as Newsletter;
      });
    
    const newsletters = await Promise.all(newsletterPromises);
    // Sort by lastUpdated, assuming it's a parseable date string or similar for comparison
    return newsletters.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  } catch (error) {
    console.error('Failed to get all newsletters:', error);
    // If the directory doesn't exist or there's an error, return empty array
    return [];
  }
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  try {
    const filePath = path.join(dataDir, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to get newsletter ${id}:`, error);
    return null;
  }
}

export async function saveNewsletter(newsletter: Newsletter): Promise<void> {
  try {
    const filePath = path.join(dataDir, `${newsletter.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newsletter, null, 2), 'utf8');
  } catch (error) {
    console.error(`Failed to save newsletter ${newsletter.id}:`, error);
  }
}

export async function deleteNewsletter(id: string): Promise<void> {
  try {
    const filePath = path.join(dataDir, `${id}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete newsletter ${id}:`, error);
  }
}
