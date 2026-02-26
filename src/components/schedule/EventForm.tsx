import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CalendarEvent, EventType, GameResult } from '@/types';

type FormData = Omit<CalendarEvent, 'id'>;

interface EventFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'Practice', label: 'Practice' },
  { value: 'Game', label: 'Game' },
  { value: 'Tournament', label: 'Tournament' },
];

const RESULTS: { value: GameResult; label: string }[] = [
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Win', label: 'Win' },
  { value: 'Loss', label: 'Loss' },
  { value: 'Draw', label: 'Draw' },
];

export function EventForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Add Event' }: EventFormProps) {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      type: 'Practice',
      result: 'Upcoming',
      homeOrAway: 'Home',
      isCompleted: false,
      notes: '',
      ...defaultValues,
    },
  });

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Event Type"
        id="type"
        options={EVENT_TYPES}
        {...register('type')}
      />

      <Input
        label="Title"
        id="title"
        placeholder={type === 'Game' ? 'vs. Opponent FC' : 'Team Practice'}
        {...register('title', { required: 'Required' })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" id="date" type="date" {...register('date', { required: 'Required' })} />
        <Input label="Time" id="time" type="time" {...register('time', { required: 'Required' })} />
      </div>

      <Input label="Location" id="location" placeholder="Field name or address" {...register('location', { required: 'Required' })} />

      {type === 'Game' || type === 'Tournament' ? (
        <>
          <Input label="Opponent" id="opponent" placeholder="Team name" {...register('opponent')} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Home / Away"
              id="homeOrAway"
              options={[
                { value: 'Home', label: 'Home' },
                { value: 'Away', label: 'Away' },
              ]}
              {...register('homeOrAway')}
            />
            <Select label="Result" id="result" options={RESULTS} {...register('result')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Goals For" id="goalsFor" type="number" min="0" {...register('goalsFor', { valueAsNumber: true })} />
            <Input label="Goals Against" id="goalsAgainst" type="number" min="0" {...register('goalsAgainst', { valueAsNumber: true })} />
          </div>
        </>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Focus area, reminders..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isCompleted" {...register('isCompleted')} className="rounded" />
        <label htmlFor="isCompleted" className="text-sm text-gray-700">Mark as completed</label>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
