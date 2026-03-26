/**
 * API Client Service
 * Handles all external API requests
 */

interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseURL: string = "https://mb9lhe9i9l.execute-api.sa-east-1.amazonaws.com") {
    this.baseURL = baseURL;
  }

  /**
   * Set the base URL for API requests
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Get the current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = config.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", timeout });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body: data, timeout });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body: data, timeout });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", timeout });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: unknown, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body: data, timeout });
  }
}

export default new ApiClient();
