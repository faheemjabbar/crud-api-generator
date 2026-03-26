import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing async operations with loading, error, and data states
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} [immediate=false] - Whether to execute immediately on mount
 * @returns {Object} Object containing execute function, loading state, data, and error
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    loading,
    data,
    error,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, [])
  };
};

/**
 * Hook for managing async operations with progress tracking
 * @param {Function} asyncFunction - The async function to execute
 * @returns {Object} Object containing execute function, loading state, progress, data, and error
 */
export const useAsyncWithProgress = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const result = await asyncFunction(...args, setProgress);
      setData(result);
      setProgress(100);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return {
    execute,
    loading,
    progress,
    data,
    error,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
      setProgress(0);
    }, [])
  };
};