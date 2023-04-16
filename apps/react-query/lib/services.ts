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

type FindAllTodosInput = {
  page?: number;
  size?: number;
  filter?: FindAllTodosFilterInput;
};

export type FindAllTodosReturn = {
  todos: ITodo[];
  hasNext: boolean;
  nextPage: number | null;
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
  const nextPage = hasNext ? page + 1 : null;

  logRequest({
    path: '/todos',
    method: 'GET',
  });

  return {
    todos,
    hasNext,
    nextPage,
  };
}

export async function find(id: number) {
  await sleep();

  const todo = __todos__.find((todo) => id === todo.id);

  if (!todo) throw new DoesNotExistError();

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
  await sleep();

  const id = (__todos__.at(0)?.id ?? 0) + 1;
  const todo: ITodo = { id, ...input };

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
  completedAt?: Date;
};

export async function update(id: number, input: UpdateTodoInput) {
  await sleep();

  let todo = await find(id);

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
  await find(id);

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
