import { useCallback, useState } from 'react';

type UseBooleanArg = {
  defaultValue?: boolean;
};

export type UseBooleanReturn = [
  flag: boolean,
  setFlag: {
    on(): void;
    off(): void;
    toggle(): void;
  },
];

export function useBoolean({
  defaultValue,
}: UseBooleanArg = {}): UseBooleanReturn {
  const [state, setState] = useState(!!defaultValue);

  const on = useCallback(() => {
    setState(true);
  }, []);

  const off = useCallback(() => {
    setState(false);
  }, []);

  const toggle = useCallback(() => {
    setState((s) => !s);
  }, []);

  return [state, { on, off, toggle }];
}
