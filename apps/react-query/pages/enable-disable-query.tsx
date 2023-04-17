import { useBoolean } from '@examples/hooks';
import { Portal } from '@headlessui/react';
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../lib/components';
import { TodoCard } from '../lib/components/TodoCard';
import services from '../lib/services';

export default function EnableDisableQuery() {
  const [isEnabled, setEnabled] = useBoolean();

  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn() {
      return services.todo.findAll({
        page: 1,
        size: 3,
      });
    },
    enabled: isEnabled,
    staleTime: 0,
  });

  return (
    <>
      <div className="space-y-3">
        {data?.todos.map((todo) => (
          <TodoCard key={todo.id} data={todo} />
        ))}
      </div>

      <Portal>
        <Button
          className="fixed right-4 bottom-4 rounded-full p-3"
          onClick={setEnabled.toggle}
        >
          {isEnabled && <StopIcon className="h-6 w-6" />}
          {!isEnabled && <PlayIcon className="h-6 w-6" />}
        </Button>
      </Portal>
    </>
  );
}
