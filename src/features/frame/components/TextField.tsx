import { type ChangeEvent, type Ref, useEffect, useId, useState } from 'react';
import { Input } from '#/components/ui/input.tsx';
import { Label } from '#/components/ui/label.tsx';
import { cn } from '#/lib/utils.ts';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  id?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  id,
  className,
  ref,
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
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        ref={ref}
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
      />
    </div>
  );
};
