import { debug } from '@examples/shared';
import { useQuery } from '@tanstack/react-query';
import client from '../lib/config';

export default function QueryKeys() {
  useQuery({
    queryKey: ['users', 'list'],
    queryFn() {
      debug.info('Users');
      return [];
    },
  });

  useQuery({
    queryKey: ['users', 'list', { category: 'GUEST' }],
    queryFn() {
      debug.info('Users (Aa)');
      return [];
    },
  });

  useQuery({
    queryKey: ['users', 'detail', 1],
    queryFn() {
      debug.info('User 1');
      return {};
    },
  });

  useQuery({
    queryKey: ['users', 'detail', 2],
    queryFn() {
      debug.info('User 2');
      return {};
    },
  });

  debug.info('🦄🦄🦄🦄🦄');

  return (
    <div>
      <button
        onClick={() => {
          client.invalidateQueries(['users', 'detail']);
        }}
      >
        Click me
      </button>
    </div>
  );
}
