import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pagination } from '../../lib/components';
import { TodoCard, TodoCardSkeleton } from '../../lib/components/todo-card';
import client from '../../lib/config';
import services from '../../lib/services';

export default function Example1() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);

  const queryKey = ['todos', { page, size }];

  const { data, isFetching, isInitialLoading } = useQuery({
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
        <TodoCardSkeleton when={isInitialLoading} count={size} />

        {data?.todos.map((todo) => (
          <TodoCard
            key={todo.id}
            data={todo}
            onDeleted={() => {
              client.invalidateQueries(['todos']);
            }}
          />
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
        isLoading={isFetching}
      />
    </div>
  );
}
