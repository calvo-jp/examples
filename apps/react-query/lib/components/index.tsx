import { Dialog, Transition } from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  ComponentProps,
  forwardRef,
  Fragment,
  PropsWithChildren,
  useCallback,
} from 'react';
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  function Input(props, ref) {
    const { className, ...others } = props;

    return (
      <input
        ref={ref}
        className={twMerge(
          className,
          'block w-full rounded-md border border-gray-200 px-4 py-2 text-lg outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-sky-300 focus:ring-4 focus:ring-sky-400/10 aria-[invalid]:border-red-300 aria-[invalid]:focus:ring-red-400/10',
        )}
        {...others}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  function Input({ className, minRows = 2, maxRows = 5, ...props }, ref) {
    return (
      <ReactTextareaAutosize
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        className={twMerge(
          className,
          'block w-full resize-none rounded-md border border-gray-200 px-4 py-2 text-lg outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-sky-300 focus:ring-4 focus:ring-sky-400/10 aria-[invalid]:border-red-300 aria-[invalid]:focus:ring-red-400/10',
        )}
        {...props}
      />
    );
  },
);

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'solid' | 'subtle' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = 'solid', className, children, ...others } = props;

    return (
      <button
        ref={ref}
        className={twMerge(
          'rounded-md px-3 py-2 text-lg tracking-wide outline-none transition-all duration-300',
          variant === 'solid' &&
            'bg-sky-400 text-white hover:bg-sky-400/90 focus:ring-4 focus:ring-sky-300/20',
          variant === 'subtle' &&
            'bg-gray-50 text-gray-500 hover:bg-sky-100 hover:text-sky-600 disabled:cursor-not-allowed disabled:bg-gray-50/50 disabled:text-gray-300',
          variant === 'outline' &&
            'border border-sky-300 bg-white text-sky-500 hover:bg-sky-50 focus:bg-sky-50 disabled:cursor-not-allowed disabled:border-gray-50 disabled:text-gray-300 disabled:hover:bg-white',
          className,
        )}
        {...others}
      >
        {children}
      </button>
    );
  },
);

export const CloseButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'>
>(function CloseButton(props, ref) {
  const { className, ...others } = props;

  return (
    <button
      ref={ref}
      className={twMerge(
        'rounded-full bg-black/40 p-0.5 text-white/80 transition-colors duration-300 hover:bg-black/60 hover:text-white focus:bg-black/60 focus:text-white disabled:cursor-not-allowed disabled:bg-black/20 group-hover:block',
        className,
      )}
      {...others}
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  );
});

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose(): void;
}>;

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Transition as={Fragment} show={isOpen} appear>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white px-12 py-14 shadow-md">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface PaginationProps
  extends Omit<ComponentProps<'div'>, 'size' | 'onChange'> {
  page?: number;
  size?: number;
  count?: number;
  sizes?: number[];
  onChange?(ctx: { page: number; size: number }): void;
  isLoading?: boolean;
}

export function Pagination({
  page = 1,
  size = 5,
  count = 0,
  sizes = [],
  onChange,
  className,
  isLoading,
  ...props
}: PaginationProps) {
  const totalPages = Math.ceil(count / size);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const next = useCallback(() => {
    if (!hasNext) return;

    onChange?.({
      size,
      page: page + 1,
    });
  }, [
    //
    page,
    size,
    onChange,
    hasNext,
  ]);

  const prev = useCallback(() => {
    if (!hasPrev) return;

    onChange?.({
      size,
      page: page - 1,
    });
  }, [
    //
    page,
    size,
    onChange,
    hasPrev,
  ]);

  const shouldDisabledPrev = isLoading || !hasPrev;
  const shouldDisabledNext = isLoading || !hasNext;

  return (
    <div className={twMerge(className, 'flex items-center gap-4')} {...props}>
      <div role="status" aria-live="polite" className="text-gray-500">
        Page {page} of {totalPages}
      </div>

      <div className="grow" />

      <div className="flex gap-3">
        <Button
          variant="subtle"
          disabled={shouldDisabledPrev}
          className="rounded-full p-2"
          onClick={prev}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="subtle"
          disabled={shouldDisabledNext}
          className="rounded-full p-2"
          onClick={next}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
