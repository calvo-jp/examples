import { useCallback, useState } from 'react';

type UseDisclosureOptions = {
  defaultIsOpen?: boolean;
};

export type UseDisclosureReturn = {
  isOpen: boolean;
  onOpen(): void;
  onClose(): void;
  onToggle(): void;
};

export function useDisclosure(options?: UseDisclosureOptions): UseDisclosureReturn {
  const [isOpen, setOpen] = useState(!!options?.defaultIsOpen);

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((s) => !s), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}
