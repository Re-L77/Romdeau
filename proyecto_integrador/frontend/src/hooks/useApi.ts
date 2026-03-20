import { useState, useCallback } from "react";
import { apiClient, ApiError } from "../services/api";
import { ErrorType } from "../utils/errors";

interface UseApiOptions {
  onError?: (error: ApiError) => void;
  onSuccess?: () => void;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  errorType: ErrorType | null;
  execute: () => Promise<T | null>;
  clearError: () => void;
}

/**
 * Hook para hacer peticiones GET al API
 */
export function useApiGet<T = any>(
  path: string,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const result = await apiClient.get<T>(path);
      setData(result);
      options.onSuccess?.();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setErrorType(apiError.type || "UNKNOWN");
      options.onError?.(apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [path, options]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  return { data, isLoading, error, errorType, execute, clearError };
}

/**
 * Hook para hacer peticiones POST/PUT/DELETE al API
 */
export function useApiMutation<T = any, D = any>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  options: UseApiOptions = {},
): UseApiReturn<T> & { mutate: (data?: D) => Promise<T | null> } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const execute = useCallback(
    async (mutationData?: D): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setErrorType(null);

      try {
        let result: T;

        switch (method) {
          case "POST":
            result = await apiClient.post<T>(path, mutationData);
            break;
          case "PUT":
            result = await apiClient.put<T>(path, mutationData);
            break;
          case "DELETE":
            result = await apiClient.delete<T>(path);
            break;
        }

        setData(result);
        options.onSuccess?.();
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        setErrorType(apiError.type || "UNKNOWN");
        options.onError?.(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [method, path, options],
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    errorType,
    execute,
    mutate: execute,
    clearError,
  };
}

/**
 * Hook para hacer peticiones POST
 */
export function useApiPost<T = any, D = any>(
  path: string,
  options: UseApiOptions = {},
) {
  return useApiMutation<T, D>("POST", path, options);
}

/**
 * Hook para hacer peticiones PUT
 */
export function useApiPut<T = any, D = any>(
  path: string,
  options: UseApiOptions = {},
) {
  return useApiMutation<T, D>("PUT", path, options);
}

/**
 * Hook para hacer peticiones DELETE
 */
export function useApiDelete<T = any>(
  path: string,
  options: UseApiOptions = {},
) {
  return useApiMutation<T>("DELETE", path, options);
}
