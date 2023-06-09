import { arrayChunk, sleep } from '@examples/shared';
import { todos } from './fixtures';
import { ITodo } from './types';
import { logRequest } from './utils';

let __todos__: ITodo[] = [...todos];

class DoesNotExistError extends Error {}

type FindAllTodosFilterInput = {
  search?: string;
  complete?: boolean;
};

export type FindAllTodosInput = {
  page?: number;
  size?: number;
  filter?: FindAllTodosFilterInput;
};

export type FindAllTodosReturn = {
  todos: ITodo[];
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
  totalCount: number;
};

export async function findAll(
  input: FindAllTodosInput = {},
): Promise<FindAllTodosReturn> {
  await sleep();

  const { page, size, filter } = Object.assign(
    {
      page: 1,
      size: __todos__.length,
      filter: {
        search: '',
      },
    },
    input,
  );

  const search = filter.search.toLowerCase().trim();
  const filtered = __todos__
    .filter(({ title, description }) => {
      return [title, description].some((s) => s.toLowerCase().includes(search));
    })
    .filter(({ isComplete }) => {
      if (typeof filter.complete === 'boolean') {
        return filter.complete === isComplete;
      } else {
        return true;
      }
    });

  const chunks = arrayChunk(filtered, size);
  const todos = chunks.at(page - 1) ?? [];
  const hasNext = page < chunks.length;
  const hasPrev = page > 1;
  const prevPage = hasPrev ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;
  const totalCount = filtered.length;

  logRequest({
    path: '/todos',
    method: 'GET',
    queries: {
      page,
      size,
      search,
    },
  });

  return {
    todos,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    totalCount,
  };
}

export async function find(id: number, log = true) {
  await sleep();

  const todo = __todos__.find((todo) => id === todo.id);

  if (!todo) throw new DoesNotExistError();

  log &&
    logRequest({
      path: '/todos',
      params: id,
      method: 'GET',
    });

  return todo;
}

export type CreateTodoInput = {
  title: string;
  description: string;
};

export async function create(input: CreateTodoInput) {
  await sleep(1000);

  const id = (__todos__.at(0)?.id ?? 0) + 1;
  const todo: ITodo = { id, ...input };

  if (input.title.toLowerCase() === '_error') throw new Error();

  __todos__ = [todo, ...__todos__];

  logRequest({
    path: '/todos',
    method: 'POST',
  });

  return todo;
}

export type UpdateTodoInput = {
  title?: string;
  description?: string;
  isComplete?: boolean;
};

export async function update(id: number, input: UpdateTodoInput) {
  await sleep();

  let todo = await find(id, false);

  todo = {
    ...todo,
    ...input,
  };

  logRequest({
    path: '/todos',
    params: id,
    method: 'PATCH',
  });

  return todo;
}

export async function remove(id: number) {
  await find(id, false);

  logRequest({
    path: '/todos',
    params: id,
    method: 'DELETE',
  });

  __todos__ = __todos__.filter((todo) => todo.id !== id);
}

export async function ping() {
  await sleep();

  logRequest({
    path: '/ping',
    method: 'HEAD',
  });

  return new Date();
}

const services = {
  todo: {
    find,
    findAll,
    create,
    update,
    delete: remove,
  },
  ping,
};

export default services;
