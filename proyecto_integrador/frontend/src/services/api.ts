const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw {
      message: error.message || `Error: ${response.status}`,
      statusCode: response.status,
    } as ApiError;
  }
  return response.json();
};

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  logout: async (accessToken: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse(response);
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return handleResponse(response);
  },

  verifyToken: async (accessToken: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse(response);
  },
};
