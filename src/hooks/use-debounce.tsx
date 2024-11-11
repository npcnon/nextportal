import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const useDebounce = <T extends object>(
  initialState: T,
  delay: number = 300
): [T, (newState: Partial<T>) => void] => {
  const [state, setState] = useState<T>(initialState);

  const debouncedSetState = useCallback(
    debounce((newState: Partial<T>) => {
      setState((prevState) => ({
        ...prevState,
        ...newState,
      }));
    }, delay),
    [delay]
  );

  return [state, debouncedSetState];
};

export default useDebounce;