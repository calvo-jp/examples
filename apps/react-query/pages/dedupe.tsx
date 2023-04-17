import { useQuery } from '@tanstack/react-query';
import { Box } from '../lib/components';
import services, { FindAllTodosInput } from '../lib/services';

export default function Dedupe() {
  return (
    <div className="space-y-2">
      <ComponentA />
      <ComponentB />
    </div>
  );
}

function ComponentA() {
  const { data } = useTodos();

  console.log({ data });

  return <Box>Component A</Box>;
}

function ComponentB() {
  const { data } = useTodos();

  console.log({ data });

  return <Box>Component B</Box>;
}

function useTodos(input: FindAllTodosInput = {}) {
  const { page, size } = Object.assign(
    {
      page: 1,
      size: 3,
    },
    input,
  );

  return useQuery({
    queryKey: ['todos', { page, size }],
    queryFn() {
      return services.todo.findAll({ page, size });
    },
  });
}
