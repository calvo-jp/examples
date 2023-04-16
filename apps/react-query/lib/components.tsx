import clsx from 'clsx';
import { ComponentProps, forwardRef } from 'react';
import ReactTextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        className,
        'block w-full rounded-md border border-gray-200 px-4 py-2 text-lg outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-sky-300 focus:ring-4 focus:ring-sky-400/10 aria-[invalid]:border-red-300 aria-[invalid]:focus:ring-red-400/10',
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  function Input({ className, minRows = 2, maxRows = 5, ...props }, ref) {
    return (
      <ReactTextareaAutosize
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        className={clsx(
          className,
          'block w-full resize-none rounded-md border border-gray-200 px-4 py-2 text-lg outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-sky-300 focus:ring-4 focus:ring-sky-400/10 aria-[invalid]:border-red-300 aria-[invalid]:focus:ring-red-400/10',
        )}
        {...props}
      />
    );
  },
);
