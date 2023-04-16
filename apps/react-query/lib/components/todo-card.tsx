import { useDisclosure } from '@examples/hooks';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import * as yup from 'yup';
import { Button, CloseButton, Input, Modal, Textarea } from '.';
import services, { UpdateTodoInput } from '../services';
import { ITodo } from '../types';

interface TodoCardProps {
  data: ITodo;
  onUpdated?(data: ITodo): void;
  onDeleted?(data: ITodo): void;
}

export function TodoCard({ data, onUpdated, onDeleted }: TodoCardProps) {
  const deleteMutation = useMutation({
    mutationKey: ['deleteTodo'],
    mutationFn: services.todo.delete,
    onSuccess() {
      onDeleted?.(data);
    },
  });

  const updateMutation = useMutation({
    mutationKey: ['updateTodo', data.id],
    async mutationFn(input: UpdateTodoInput) {
      return await services.todo.update(data.id, input);
    },
    onSuccess(updatedTodo) {
      onUpdated?.(updatedTodo);
      form.reset(updatedTodo);
    },
  });

  const disclosure = useDisclosure();

  const form = useForm<yup.InferType<typeof UpdateTodoSchema>>({
    shouldUnregister: true,
    shouldFocusError: true,
    resolver: yupResolver(UpdateTodoSchema),
    defaultValues: { ...data },
  });

  const handleUpdate = form.handleSubmit(async (data) => {
    await updateMutation.mutateAsync(data);
    disclosure.onClose();
  });

  return (
    <div
      className={twMerge(
        'group relative flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 aria-disabled:opacity-40',
      )}
      {...(deleteMutation.isLoading && {
        'aria-busy': true,
        'aria-disabled': true,
      })}
    >
      <button
        tabIndex={-1}
        disabled={data.isComplete}
        className={twMerge(
          data.isComplete && 'text-emerald-500',
          !data.isComplete &&
            'text-gray-300 transition-colors duration-300 hover:text-gray-400',
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          updateMutation.mutate({ isComplete: true });
        }}
      >
        <CheckCircleIcon className="h-5 w-5" />
      </button>

      <div
        className="grow cursor-text select-none"
        onDoubleClick={(e) => {
          disclosure.onOpen();
        }}
      >
        <h2 className="text-xl">{data.title}</h2>
        <p className="line-clamp-1 text-gray-500">{data.description}</p>
      </div>

      <CloseButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          deleteMutation.mutate?.(data.id);
        }}
        disabled={deleteMutation.isLoading}
        className="animate-fadein absolute top-0 right-0 -mt-2.5 -mr-2.5 hidden focus:block group-hover:block"
      />

      <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
        <form onSubmit={handleUpdate} className="space-y-5">
          <Input
            autoFocus
            placeholder="Title"
            {...form.register('title')}
            {...(form.formState.errors.title && {
              'aria-invalid': true,
              'aria-errormessage': form.formState.errors.title.message,
            })}
          />

          <Textarea
            placeholder="Description"
            {...form.register('description')}
            {...(form.formState.errors.description && {
              'aria-invalid': true,
              'aria-errormessage': form.formState.errors.description.message,
            })}
          />

          <Button
            variant="outline"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Loading...' : 'Submit'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

const UpdateTodoSchema = yup
  .object({
    title: yup.string().min(2).max(25).required(),
    description: yup.string().min(2).max(255).required(),
  })
  .required();

interface TodoCardSkeletonProps {
  when?: boolean;
  count?: number;
}

export function TodoCardSkeleton({ when, count = 1 }: TodoCardSkeletonProps) {
  if (!when) return null;

  return (
    <>
      {new Array(count).fill(null).map((...args) => (
        <div
          key={args[1]}
          className="flex animate-pulse items-center gap-4 rounded-md bg-gray-50 px-4 py-5"
        >
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="grow">
            <div className="h-5 w-1/3 rounded-md bg-gray-200" />
            <div className="mt-2 h-3.5 w-2/3 rounded-md bg-gray-200" />
          </div>
        </div>
      ))}
    </>
  );
}
