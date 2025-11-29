const FACTORY_URL = process.env.NEXT_PUBLIC_CONTENT_FACTORY_URL || 'https://content-factory-app.pages.dev';
const FACTORY_SECRET = process.env.CONTENT_FACTORY_SECRET;

export type JobStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface FactoryJobResponse {
  success: boolean;
  jobId: string;
  status: JobStatus;
  output?: string; // URL of the generated video
  error?: string;
}

/**
 * Send a generation task to the Content Factory (Server-Side Only)
 */
export async function createGenerationJob(params: {
  sourceUrl: string;
  prompt?: string | number; // Motion bucket ID (1-255) or text prompt
  metadata?: {
    userId: string;
    projectId?: string;
    type: 'avatar' | 'plan_item';
  }
}): Promise<FactoryJobResponse> {
  
  if (!FACTORY_SECRET) {
    console.error('CONTENT_FACTORY_SECRET is not configured in environment variables');
    throw new Error('Service configuration error');
  }

  try {
    const res = await fetch(`${FACTORY_URL}/api/v1/job/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FACTORY_SECRET}`
      },
      body: JSON.stringify({
        sourceUrl: params.sourceUrl,
        model: 'svd-xt', // Default model for now
        metadata: {
          motion_bucket_id: Number(params.prompt) || 127,
          ...params.metadata
        }
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Factory API Error: ${res.status} ${errText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('Content Factory Error:', error);
    return { success: false, jobId: '', status: 'failed', error: error.message };
  }
}

/**
 * Check the status of a specific job
 */
export async function checkJobStatus(jobId: string) {
  if (!FACTORY_SECRET) {
    throw new Error('CONTENT_FACTORY_SECRET is not configured');
  }

  try {
    const res = await fetch(`${FACTORY_URL}/api/v1/job/${jobId}`, {
      headers: { 'Authorization': `Bearer ${FACTORY_SECRET}` },
      cache: 'no-store'
    });
    
    if (!res.ok) {
       // If 404 or other error, return basic failed status
       return { success: false, status: 'failed', error: `Status check failed: ${res.status}` };
    }

    return await res.json();
  } catch (error: any) {
    console.error('Check Status Error:', error);
    return { success: false, status: 'failed', error: error.message };
  }
}
