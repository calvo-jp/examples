import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pagination } from '../lib/components';
import { CreateTodoModal } from '../lib/components/CreateTodoModal';
import { TodoCard, TodoCardSkeleton } from '../lib/components/TodoCard';
import client from '../lib/config';
import services, { FindAllTodosReturn } from '../lib/services';

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

  const createMutation = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: services.todo.create,
    onMutate(newTodo) {
      const targetKey = [queryKey[0], { page: 1, size: queryKey[1].size }];
      const previousData = client.getQueryData<FindAllTodosReturn>(targetKey);

      const updatedData = {
        ...previousData,
        todos: [
          {
            ...newTodo,
            id: crypto.randomUUID(),
            __PENDING__: true,
          },
          ...previousData.todos.slice(0, size - 1),
        ],
      };

      client.setQueryData(targetKey, updatedData);
      setPage(1);
      client.cancelQueries(targetKey);

      return {
        updatedData,
        previousData,
      };
    },
    onSettled(newTodo) {
      const currentData = client.getQueryData<FindAllTodosReturn>(queryKey);
      const updatedData = {
        ...currentData,
        todos: currentData.todos.map((existingTodo) => {
          if ('isPending' in existingTodo) {
            return newTodo;
          } else {
            return existingTodo;
          }
        }),
      };

      client.setQueryData(queryKey, updatedData);
    },
    onError(_err, _newTodo, context) {
      client.setQueryData(queryKey, context.previousData);
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

      <CreateTodoModal onSubmit={createMutation.mutate} />
    </div>
  );
}
