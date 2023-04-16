import { useDebounce, useDisclosure } from '@examples/hooks';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { dehydrate, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { GetStaticProps } from 'next';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Input, Textarea } from '../lib/components';
import client from '../lib/config';
import services, { FindAllTodosReturn } from '../lib/services';
import { ITodo } from '../lib/types';
import { rm_undefined } from '../lib/utils';

export const getStaticProps: GetStaticProps = async () => {
  await client.prefetchInfiniteQuery({
    queryKey: ['todos', { search: '' }],
    queryFn() {
      return services.todo.findAll({
        page: 1,
        size: 3,
        filter: {
          search: '',
        },
      });
    },
  });

  return {
    props: {
      dehydratedState: rm_undefined(dehydrate(client)),
    },
  };
};

export default function Todos() {
  const [keyword, setKeyword] = useState('');

  const search = useDebounce(keyword);

  const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['todos', { search }],
      queryFn(context) {
        const page = context.pageParam.page ?? 1;
        const size = context.pageParam.size ?? 3;

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
      placeholderData: {
        pages: [],
        pageParams: null,
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
        {isLoading && (
          <Fragment>
            <TodoSkeleton />
            <TodoSkeleton />
            <TodoSkeleton />
            <TodoSkeleton />
          </Fragment>
        )}

        {data.pages.map((row) => (
          <Todo
            key={row.id}
            data={row}
            onDeleted={() => {
              client.setQueriesData<{
                pages: FindAllTodosReturn[];
                [key: string]: unknown;
              }>(['todos', { search }], (old) => {
                console.log({ old });

                return old;
              });
            }}
          />
        ))}

        {isFetchingNextPage && <TodoSkeleton />}
      </section>

      {hasNextPage && (
        <section className="mt-6 flex justify-center">
          <button
            onClick={() => {
              fetchNextPage();
            }}
            disabled={isFetching}
            className="rounded-full bg-gray-50 p-3 text-gray-500 transition-colors duration-300 hover:bg-sky-100 hover:text-sky-600 disabled:cursor-not-allowed disabled:bg-gray-50/50 disabled:text-gray-300"
          >
            <ChevronDownIcon className="h-5 w-5" />
          </button>
        </section>
      )}

      <CreateTodo />
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
  const { mutate, isLoading } = useMutation({
    mutationKey: ['deleteTodo'],
    async mutationFn() {
      await services.todo.delete(data.id);
    },
    onSuccess() {
      onDeleted?.(data);
    },
  });

  return (
    <div className="group relative flex items-center gap-3 rounded-md border border-gray-200 p-4">
      <button
        tabIndex={-1}
        disabled={data.isComplete}
        className={clsx(
          data.isComplete && 'text-emerald-500',
          !data.isComplete &&
            'text-gray-300 transition-colors duration-300 hover:text-gray-400',
        )}
      >
        <CheckCircleIcon className="h-5 w-5" />
      </button>

      <div className="grow">
        <h2 className="text-xl">{data.title}</h2>
        <p className="line-clamp-1 text-gray-500">{data.description}</p>
      </div>

      <button
        className="animate-fadein absolute top-0 right-0 -mt-3 -mr-3 hidden rounded-full bg-black/40 p-1 text-white transition-colors duration-300 hover:bg-black/60 focus:block focus:bg-black/60 disabled:cursor-not-allowed disabled:bg-black/20 group-hover:block"
        disabled={isLoading}
        onClick={async () => {
          mutate();
        }}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function TodoSkeleton() {
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
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { mutate } = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: services.todo.create,
    onSuccess(data) {
      onCreated?.(data);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    mutate(data);
  });

  return (
    <>
      <button
        className="z-floating-button fixed bottom-4 right-4 rounded-full bg-sky-400 p-3 text-white shadow-md outline-none transition-all duration-300 hover:bg-sky-400/90 focus:ring-4 focus:ring-sky-300/20"
        onClick={onOpen}
      >
        <PencilSquareIcon className="h-6 w-6" />
      </button>

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
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
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

                    <button className="block w-full rounded-md border border-sky-300 px-3 py-2 text-lg uppercase tracking-wide text-sky-500 outline-none transition-all duration-300 hover:bg-sky-50 focus:bg-sky-50">
                      Submit
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const createTodoSchema = yup
  .object({
    title: yup.string().min(2).max(25).trim().required(),
    description: yup.string().min(2).max(255).trim().required(),
  })
  .required();
