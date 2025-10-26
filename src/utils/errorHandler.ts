import { AxiosError } from 'axios';

export interface ApiError extends Error {
  status?: number;
  url?: string;
  fullUrl?: string;
  method?: string;
  isNotFound?: boolean;
  isUnauthorized?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
  data?: any;
}

export class ErrorHandler {
  /**
   * Handle API errors gracefully
   */
  static handleApiError(error: any): ApiError {
    const apiError: ApiError = {
      name: 'ApiError',
      message: error.message || 'An error occurred',
      status: error.status || error.response?.status,
      url: error.url || error.config?.url,
      fullUrl: error.fullUrl || `${error.config?.baseURL}${error.config?.url}`,
      method: error.method || error.config?.method,
      isNotFound: error.isNotFound || error.response?.status === 404,
      isUnauthorized: error.isUnauthorized || error.response?.status === 401,
      isServerError: error.isServerError || (error.response?.status >= 500),
      isClientError: error.isClientError || (error.response?.status >= 400 && error.response?.status < 500),
      data: error.data || error.response?.data,
    };

    return apiError;
  }

  /**
   * Check if error is a 404 (Not Found)
   */
  static isNotFound(error: any): boolean {
    return error.status === 404 || error.response?.status === 404 || error.isNotFound;
  }

  /**
   * Check if error is a 401 (Unauthorized)
   */
  static isUnauthorized(error: any): boolean {
    return error.status === 401 || error.response?.status === 401 || error.isUnauthorized;
  }

  /**
   * Check if error is a server error (5xx)
   */
  static isServerError(error: any): boolean {
    const status = error.status || error.response?.status;
    return status >= 500 || error.isServerError;
  }

  /**
   * Check if error is a client error (4xx)
   */
  static isClientError(error: any): boolean {
    const status = error.status || error.response?.status;
    return status >= 400 && status < 500 || error.isClientError;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    const status = error.status || error.response?.status;
    
    switch (status) {
      case 404:
        return 'The requested resource was not found.';
      case 401:
        return 'You are not authorized to access this resource.';
      case 403:
        return 'Access to this resource is forbidden.';
      case 422:
        return 'The request data is invalid.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 502:
        return 'Service temporarily unavailable.';
      case 503:
        return 'Service is currently unavailable.';
      default:
        if (status >= 500) {
          return 'A server error occurred. Please try again later.';
        } else if (status >= 400) {
          return 'A client error occurred. Please check your request.';
        } else {
          return error.message || 'An unexpected error occurred.';
        }
    }
  }

  /**
   * Log error for debugging (only in development)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      const status = error.status || error.response?.status;
      
      // Use console.warn for 404 errors to avoid Next.js treating them as errors
      if (status === 404) {
        console.warn(`⚠️ Resource not found${context ? ` in ${context}` : ''}:`, {
          status,
          url: error.url || error.config?.url,
          method: error.method || error.config?.method,
          data: error.data || error.response?.data,
        });
      } else {
        // Use console.error for other errors
        console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
        console.error('Error details:', error);
        console.error('Status:', status);
        console.error('URL:', error.url || error.config?.url);
        console.error('Method:', error.method || error.config?.method);
        console.error('Data:', error.data || error.response?.data);
        console.groupEnd();
      }
    }
  }
}

export default ErrorHandler;
