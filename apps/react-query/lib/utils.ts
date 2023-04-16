import { debug } from '@examples/shared';
import { format } from 'date-fns';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

type LogRequestInput = {
  path: string;
  params?: string | number;
  method?: RequestMethod;
};

export function logRequest({ path, method = 'GET', params }: LogRequestInput) {
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  debug.info(`[${time}] [${method}] "${[path, params].filter(Boolean).join('/')}"`);
}

export function rm_undefined<T extends Record<string, any>>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}
