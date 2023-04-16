import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pagination, TodoCards, TodoCardSkeleton } from '../../lib/components';
import services from '../../lib/services';

export default function Example1() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(3);

  const { data, isFetching } = useQuery({
    queryKey: [
      'todos',
      {
        page,
        size,
      },
    ],
    queryFn() {
      return services.todo.findAll({
        page,
        size,
      });
    },
  });

  return (
    <div>
      {isFetching && <TodoCardSkeleton count={size} />}
      {!isFetching && <TodoCards data={data?.todos} />}

      <Pagination
        page={page}
        size={size}
        count={data?.totalCount}
        onChange={(ctx) => {
          setPage(ctx.page);
          setSize(ctx.size);
        }}
        className="mt-6"
      />
    </div>
  );
}
