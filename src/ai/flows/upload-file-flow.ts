
'use server';

/**
 * @fileOverview A Genkit flow for uploading files to Google Cloud Storage.
 *
 * - uploadFile - A function that handles uploading a file.
 * - UploadFileInput - The input type for the uploadFile function.
 * - UploadFileOutput - The return type for the uploadFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();
// This should be unique in your GCP project.
// You can change it to something more specific to your app.
const bucketName = process.env.GCS_BUCKET_NAME || 'newsflow-files-bucket'; 

const UploadFileInputSchema = z.object({
  fileDataUri: z.string().describe("The file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  fileName: z.string().describe('The name of the file to be uploaded.'),
});
export type UploadFileInput = z.infer<typeof UploadFileInputSchema>;

const UploadFileOutputSchema = z.object({
  url: z.string().url().describe('The public URL of the uploaded file.'),
});
export type UploadFileOutput = z.infer<typeof UploadFileOutputSchema>;


async function ensureBucketExists() {
    const [exists] = await storage.bucket(bucketName).exists();
    if (!exists) {
        // Creates the new bucket
        await storage.createBucket(bucketName, {
            location: 'US', // You can change this to your preferred location
            storageClass: 'STANDARD',
        });
        console.log(`Bucket ${bucketName} created.`);
        // Make the bucket public-to-read by default.
        // For production apps, you should use signed URLs for more granular access control.
        await storage.bucket(bucketName).makePublic();
    }
}

// Call this function once when the server starts.
ensureBucketExists().catch(console.error);


export const uploadFileFlow = ai.defineFlow(
  {
    name: 'uploadFileFlow',
    inputSchema: UploadFileInputSchema,
    outputSchema: UploadFileOutputSchema,
  },
  async ({ fileDataUri, fileName }) => {
    const bucket = storage.bucket(bucketName);
    
    // Extract content type and data from data URI
    const match = fileDataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid data URI format.');
    }
    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a unique name for the file to avoid conflicts
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const file = bucket.file(uniqueFileName);

    await file.save(buffer, {
      metadata: {
        contentType: contentType,
      },
    });

    // Make the file public
    await file.makePublic();

    return {
      url: file.publicUrl(),
    };
  }
);

export async function uploadFile(
    input: UploadFileInput
  ): Promise<UploadFileOutput> {
    return uploadFileFlow(input);
}
