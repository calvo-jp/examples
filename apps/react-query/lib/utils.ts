import { debug } from '@examples/shared';
import { format } from 'date-fns';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

type LogRequestInput = {
  path: string;
  params?: string | number;
  method?: RequestMethod;
  queries?: Record<string, any>;
};

export function logRequest({
  path,
  method = 'GET',
  params,
  queries,
}: LogRequestInput) {
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  let url: string;

  url = path;
  url = params ? `${url}/${params}` : url;
  url = queries ? `${url}?${new URLSearchParams(queries).toString()}` : url;

  debug.info(`[${time}] [${method}] "${url}"`);
}

export function rm_undefined<T extends Record<string, any>>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}
