import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Player, Position } from '@/types';

type FormData = Omit<Player, 'id' | 'parentAccessCode' | 'joinedDate' | 'isActive'>;

interface PlayerFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'Any', label: 'Any Position' },
  { value: 'Goalkeeper', label: 'Goalkeeper' },
  { value: 'Defender', label: 'Defender' },
  { value: 'Midfielder', label: 'Midfielder' },
  { value: 'Forward', label: 'Forward' },
];

export function PlayerForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Add Player' }: PlayerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { position: 'Any', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          id="firstName"
          {...register('firstName', { required: 'Required' })}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          id="lastName"
          {...register('lastName', { required: 'Required' })}
          error={errors.lastName?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Jersey #"
          id="jerseyNumber"
          type="number"
          min="1"
          max="99"
          {...register('jerseyNumber', { required: 'Required', valueAsNumber: true })}
          error={errors.jerseyNumber?.message}
        />
        <Select
          label="Position"
          id="position"
          options={POSITIONS}
          {...register('position')}
        />
      </div>

      <Input
        label="Date of Birth"
        id="dateOfBirth"
        type="date"
        {...register('dateOfBirth', { required: 'Required' })}
        error={errors.dateOfBirth?.message}
      />

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Parent / Guardian</p>
        <div className="space-y-3">
          <Input
            label="Parent Name"
            id="parentName"
            {...register('parentName', { required: 'Required' })}
            error={errors.parentName?.message}
          />
          <Input
            label="Parent Email"
            id="parentEmail"
            type="email"
            {...register('parentEmail', { required: 'Required' })}
            error={errors.parentEmail?.message}
          />
          <Input
            label="Parent Phone"
            id="parentPhone"
            type="tel"
            {...register('parentPhone')}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Coach Notes (private)</p>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Notes visible only to coaches..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
