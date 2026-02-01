import * as React from 'react';

type UseLocalStorageReturn<T> = [
  T | undefined,
  (value: T | ((prev: T | undefined) => T)) => void,
  {
    remove: () => void;
    error: Error | null;
    isLoading: boolean;
  },
];

export function useLocalStorage<T>(
  key: string,
  initialValue?: T | (() => T)
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = React.useState<
    T | undefined
  >(initialValue);

  const [error, setError] = React.useState<Error | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        setStoredValue(
          initialValue instanceof Function
            ? initialValue()
            : initialValue
        );
      } else {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      setStoredValue(
        initialValue instanceof Function
          ? initialValue()
          : initialValue
      );
    }
    setIsLoading(false);
  }, [key, initialValue]);

  const setValue = React.useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      try {
        setError(null);
        const valueToStore =
          value instanceof Function
            ? value(storedValue)
            : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            key,
            JSON.stringify(valueToStore)
          );
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e
            : new Error('Failed to set localStorage')
        );
      }
    },
    [key, storedValue]
  );

  const remove = React.useCallback(() => {
    try {
      setError(null);
      setStoredValue(undefined);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e
          : new Error('Failed to remove from localStorage')
      );
    }
  }, [key]);

  return [
    storedValue,
    setValue,
    { remove, error, isLoading },
  ];
}
