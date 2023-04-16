import { useDisclosure } from '@examples/hooks';
import { Portal } from '@headlessui/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Button, Input, Modal, Textarea } from './index';

const createTodoSchema = yup
  .object({
    title: yup.string().min(2).max(25).required(),
    description: yup.string().min(2).max(255).required(),
  })
  .required();

type CreateTodoSchema = yup.InferType<typeof createTodoSchema>;

interface CreateTodoProps {
  onSubmit?(newTodo: CreateTodoSchema): void | Promise<void>;
}

export function CreateTodoModal({ onSubmit }: CreateTodoProps) {
  const disclosure = useDisclosure();

  const form = useForm<CreateTodoSchema>({
    shouldUnregister: true,
    shouldFocusError: true,
    resolver: yupResolver(createTodoSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleCreate = form.handleSubmit(async (data) => {
    await onSubmit?.(data);
    disclosure.onClose();
  });

  return (
    <>
      <Portal>
        <Button
          className="z-floating-button fixed bottom-4 right-4 rounded-full p-3 shadow-md"
          onClick={disclosure.onOpen}
        >
          <PencilSquareIcon className="h-6 w-6" />
        </Button>
      </Portal>

      <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
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
    </>
  );
}
