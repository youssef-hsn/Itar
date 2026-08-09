import { type ChangeEvent, useEffect, useId, useState } from 'react';
import { cn } from '#/lib/utils.ts';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  id?: string;
  className?: string;
};

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  id,
  className,
}: TextFieldProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [draft, setDraft] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(value);
    }
  }, [value, isFocused]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={fieldId} className="type-label text-foreground">
        {label}
      </label>
      <input
        id={fieldId}
        type="text"
        value={draft}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'type-label min-h-11 w-full rounded-sm border border-border bg-background px-3 text-foreground',
          'placeholder:text-muted-foreground',
          'focus-visible:ring-ring',
        )}
      />
    </div>
  );
};
