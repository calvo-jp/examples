import { dehydrate, useQuery } from '@tanstack/react-query';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Pagination } from '../lib/components';
import { TodoCard, TodoCardSkeleton } from '../lib/components/TodoCard';
import client from '../lib/config';
import services from '../lib/services';

export const getStaticProps: GetStaticProps = async () => {
  const args = {
    page: 1,
    size: 3,
  };

  await client.prefetchQuery({
    queryKey: ['todos', args],
    queryFn() {
      return services.todo.findAll(args);
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  };
};

export default function Todos() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);

  const queryKey = ['todos', { page, size }] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn() {
      return services.todo.findAll({
        page,
        size,
      });
    },
  });

  useEffect(() => {
    return () => {
      setPage(1);
      setSize(3);
    };
  }, []);

  return (
    <div>
      <div className="space-y-4">
        <TodoCardSkeleton when={isLoading} count={size} />

        {data?.todos.map((todo) => (
          <TodoCard key={todo.id} data={todo} />
        ))}
      </div>

      <Pagination
        page={page}
        size={size}
        count={data?.totalCount}
        onChange={(ctx) => {
          setPage(ctx.page);
          setSize(ctx.size);
        }}
        className="mt-6"
        isLoading={isLoading}
      />
    </div>
  );
}
