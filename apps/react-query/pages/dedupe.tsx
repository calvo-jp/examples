import { useQuery } from '@tanstack/react-query';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
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

function Box({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={twMerge(
        'w-fit rounded-md border border-gray-200 py-4 px-8 text-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
