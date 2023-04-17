import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '../lib/components';
import { TodoCard, TodoCardSkeleton } from '../lib/components/TodoCard';
import services from '../lib/services';

export default function Todos() {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn(context) {
      const page = context.pageParam?.page ?? 1;
      const size = context.pageParam?.size ?? 3;

      return services.todo.findAll({
        page,
        size,
      });
    },
    select({ pages, ...args }) {
      return { ...args, pages: pages.map((page) => page.todos).flat() };
    },
    getNextPageParam({ hasNext, nextPage }) {
      return hasNext ? { page: nextPage } : null;
    },
    keepPreviousData: true,
  });

  return (
    <main>
      <section className="space-y-3">
        <TodoCardSkeleton count={3} when={isLoading} />

        {data?.pages.map((row) => (
          <TodoCard key={row.id} data={row} />
        ))}

        <TodoCardSkeleton when={isFetchingNextPage} />
      </section>

      {hasNextPage && (
        <section className="mx-auto mt-6 w-fit">
          <Button
            variant="subtle"
            className="rounded-full p-3"
            disabled={isFetching}
            onClick={() => {
              fetchNextPage();
            }}
          >
            <ChevronDownIcon className="h-5 w-5" />
          </Button>
        </section>
      )}
    </main>
  );
}
