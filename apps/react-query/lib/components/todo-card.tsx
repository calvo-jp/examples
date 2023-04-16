import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';
import { CloseButton } from '.';
import services from '../services';
import { ITodo } from '../types';

interface TodoCardProps {
  data: ITodo;
  onDeleted?(data: ITodo): void;
}

export function TodoCard({ data, onDeleted }: TodoCardProps) {
  const deleteMutation = useMutation({
    mutationKey: ['deleteTodo'],
    mutationFn: services.todo.delete,
    onSuccess() {
      onDeleted?.(data);
    },
  });

  return (
    <div
      className={twMerge(
        'group relative flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 aria-disabled:opacity-40',
      )}
      {...(deleteMutation.isLoading && {
        'aria-busy': true,
        'aria-disabled': true,
      })}
    >
      <button
        tabIndex={-1}
        disabled={data.isComplete}
        className={twMerge(
          data.isComplete && 'text-emerald-500',
          !data.isComplete &&
            'text-gray-300 transition-colors duration-300 hover:text-gray-400',
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CheckCircleIcon className="h-5 w-5" />
      </button>

      <div className="grow">
        <h2 className="text-xl">{data.title}</h2>
        <p className="line-clamp-1 text-gray-500">{data.description}</p>
      </div>

      <CloseButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          deleteMutation.mutate?.(data.id);
        }}
        disabled={deleteMutation.isLoading}
        className="animate-fadein absolute top-0 right-0 -mt-2.5 -mr-2.5 hidden focus:block group-hover:block"
      />
    </div>
  );
}

interface TodoCardSkeletonProps {
  when?: boolean;
  count?: number;
}

export function TodoCardSkeleton({ when, count = 1 }: TodoCardSkeletonProps) {
  if (!when) return null;

  return (
    <>
      {new Array(count).fill(null).map((...args) => (
        <div
          key={args[1]}
          className="flex animate-pulse items-center gap-3 rounded-md bg-gray-50 px-4 py-5"
        >
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="grow">
            <div className="h-5 w-1/3 rounded-md bg-gray-200" />
            <div className="mt-2 h-3.5 w-2/3 rounded-md bg-gray-200" />
          </div>
        </div>
      ))}
    </>
  );
}
