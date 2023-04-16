import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pagination } from '../lib/components';
import { TodoCard, TodoCardSkeleton } from '../lib/components/todo-card';
import client from '../lib/config';
import services, { FindAllTodosReturn } from '../lib/services';

export default function Todos() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);

  const queryKey = ['todos', { page, size }];

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
          <TodoCard
            key={todo.id}
            data={todo}
            onUpdated={(updatedTodo) => {
              const currentData =
                client.getQueryData<FindAllTodosReturn>(queryKey);

              const updatedData = {
                ...currentData,
                todos: currentData.todos.map((existingTodo) => {
                  if (existingTodo.id === updatedTodo.id) {
                    return updatedTodo;
                  } else {
                    return existingTodo;
                  }
                }),
              };

              client.setQueryData(queryKey, updatedData);
            }}
            onDeleted={() => {
              client.invalidateQueries(['todos']);

              if (data.todos.length === 1 && data.hasPrev) {
                setPage((currentPage) => currentPage - 1);
              }
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
        isLoading={isLoading}
      />
    </div>
  );
}
