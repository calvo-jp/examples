import { useBoolean } from '@examples/hooks';
import { useQuery } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';
import { Button } from '../lib/components';
import services from '../lib/services';

export default function Polling() {
  const [isEnabled, setEnabled] = useBoolean({ defaultValue: true });

  useQuery({
    queryKey: ['todos'],
    queryFn: services.ping,
    refetchInterval: 1000,
    enabled: isEnabled,
  });

  return (
    <Button
      onClick={setEnabled.toggle}
      className={twMerge(!isEnabled && 'opacity-40')}
    >
      Toggle polling
    </Button>
  );
}
