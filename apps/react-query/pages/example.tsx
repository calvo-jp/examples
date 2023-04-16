import { useDebounce, useDisclosure } from '@examples/hooks';
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { yupResolver } from '@hookform/resolvers/yup';
import { QueryKey, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import * as yup from 'yup';
import { Button, CloseButton, Input, Modal, Textarea } from '../lib/components';
import client from '../lib/config';
import services, { FindAllTodosReturn } from '../lib/services';
import { InfiniteQueryResponse, ITodo } from '../lib/types';

export default function Todos() {
  const [keyword, setKeyword] = useState('');

  const search = useDebounce(keyword);
  const queryKey: QueryKey = ['todos', { search }];

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn(context) {
      const page = context.pageParam?.page ?? 1;
      const size = context.pageParam?.size ?? 3;

      return services.todo.findAll({
        page,
        size,
        filter: {
          search,
        },
      });
    },
    select({ pages, ...args }) {
      return { ...args, pages: pages.map((page) => page.todos).flat() };
    },
    getNextPageParam({ hasNext, nextPage }) {
      return hasNext ? { page: nextPage } : null;
    },
  });

  useEffect(() => {
    return () => {
      setKeyword('');
    };
  }, []);

  return (
    <main>
      <section>
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          placeholder="Search"
        />
      </section>

      <section className="mt-8 space-y-3">
        <TodoSkeleton when={isLoading} />
        <TodoSkeleton when={isLoading} />
        <TodoSkeleton when={isLoading} />
        <TodoSkeleton when={isLoading} />

        {data?.pages.map((row) => (
          <Todo
            key={row.id}
            data={row}
            onDeleted={() => {
              const existing =
                client.getQueryData<InfiniteQueryResponse<FindAllTodosReturn>>(
                  queryKey,
                );

              const newPages = existing.pages.map((page) => {
                return {
                  ...page,
                  todos: page.todos.filter((todo) => row.id !== todo.id),
                };
              });

              client.setQueryData(queryKey, { ...existing, pages: newPages });

              if (data.pages.length <= 1) fetchNextPage();
            }}
          />
        ))}

        <TodoSkeleton when={isFetchingNextPage} />
      </section>

      {hasNextPage && (
        <section className="mt-6 flex justify-center">
          <Button
            variant="subtle"
            onClick={() => {
              fetchNextPage();
            }}
            disabled={isFetching}
            className="rounded-full p-3"
          >
            <ChevronDownIcon className="h-5 w-5" />
          </Button>
        </section>
      )}

      <CreateTodo
        onCreated={async () => {
          client.invalidateQueries(['todos', { search }]);
        }}
      />
    </main>
  );
}

/*
 *
 * TODO
 *
 */

type TodoProps = {
  data: ITodo;
  onDeleted?(data: ITodo): void;
};

function Todo({ data, onDeleted }: TodoProps) {
  const router = useRouter();

  const { mutate, isLoading } = useMutation({
    mutationKey: ['deleteTodo'],
    mutationFn: services.todo.delete,
    onSuccess() {
      onDeleted?.(data);
    },
  });

  return (
    <div
      role="button"
      onClick={() => {
        router.push(`/${data.id}`);
      }}
      className={twMerge(
        'group relative flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 aria-disabled:opacity-40',
      )}
      {...(isLoading && {
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

          mutate(data.id);
        }}
        disabled={isLoading}
        className="animate-fadein absolute top-0 right-0 -mt-2.5 -mr-2.5 hidden focus:block group-hover:block"
      />
    </div>
  );
}

function TodoSkeleton({ when }: { when?: boolean }) {
  if (!when) return null;

  return (
    <div className="flex animate-pulse items-center gap-3 rounded-md bg-gray-50 px-4 py-5">
      <div className="h-4 w-4 rounded-full bg-gray-200" />
      <div className="grow">
        <div className="h-5 w-1/3 rounded-md bg-gray-200" />
        <div className="mt-2 h-3 w-2/3 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

/*
 *
 * CREATE TODO
 *
 */

type CreateTodoProps = {
  onCreated?(todo: ITodo): void;
};

function CreateTodo({ onCreated }: CreateTodoProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { handleSubmit, formState, register } = useForm<
    yup.InferType<typeof createTodoSchema>
  >({
    shouldUnregister: true,
    shouldFocusError: true,
    resolver: yupResolver(createTodoSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { mutateAsync } = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: services.todo.create,
    onSuccess(data) {
      onCreated?.(data);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
    onClose();
  });

  return (
    <>
      <Button
        className="z-floating-button fixed bottom-4 right-4 rounded-full p-3 shadow-md"
        onClick={onOpen}
      >
        <PencilSquareIcon className="h-6 w-6" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            placeholder="Title"
            {...register('title')}
            {...(formState.errors.title && {
              'aria-invalid': true,
              'aria-errormessage': formState.errors.title.message,
            })}
          />

          <Textarea
            placeholder="Description"
            {...register('description')}
            {...(formState.errors.description && {
              'aria-invalid': true,
              'aria-errormessage': formState.errors.description.message,
            })}
          />

          <Button
            variant="outline"
            className="w-full"
            disabled={formState.isSubmitting}
          >
            Submit
          </Button>
        </form>
      </Modal>
    </>
  );
}

const createTodoSchema = yup
  .object({
    title: yup.string().min(2).max(25).required(),
    description: yup.string().min(2).max(255).required(),
  })
  .required();
