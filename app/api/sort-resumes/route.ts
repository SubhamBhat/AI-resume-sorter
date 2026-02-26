import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sort-resumes
 * 
 * Proxy endpoint that forwards resume sorting requests to the FastAPI backend.
 * Handles multipart form data with job description and resume PDFs.
 * 
 * Environment variables:
 * - BACKEND_URL: URL of the FastAPI backend (default: http://localhost:8000)
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the request body as FormData
    const formData = await request.formData();
    
    console.log('Received request to sort-resumes');
    console.log('Backend URL:', BACKEND_URL);
    
    // Forward the multipart form data to the FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/sort-resumes`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let fetch set it for FormData
    });
    
    console.log('Backend response status:', backendResponse.status);
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({
        detail: `Backend returned status ${backendResponse.status}`,
      }));
      
      console.error('Backend error:', errorData);
      
      return NextResponse.json(errorData, { 
        status: backendResponse.status 
      });
    }
    
    // Get the response data from the backend
    const data = await backendResponse.json();
    
    console.log('Successfully processed resumes');
    console.log('Number of candidates:', data.candidates?.length);
    
    // Return the response to the client
    return NextResponse.json(data);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sort-resumes API route:', errorMessage);
    
    // Check if backend is unreachable
    if (errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          detail: 'Backend service unavailable. Make sure the FastAPI server is running at ' + BACKEND_URL 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { detail: `Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
