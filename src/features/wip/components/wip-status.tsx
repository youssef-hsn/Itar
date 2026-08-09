import { cn } from '#/lib/utils.ts';

type Props = {
  className?: string;
};

export const WipStatus = ({ className }: Props) => {
  return (
    <main
      className={cn('flex min-h-dvh flex-col items-center justify-center px-6 py-16', className)}
    >
      <div className="flex max-w-md flex-col items-start gap-5 text-left">
        <h1 className="type-display text-ink-900">Itar</h1>
        <p className="type-body max-w-[40ch] text-ink-700">
          A lightweight tool to frame images in customizable Arabic borders. Coming soon.
        </p>
        <p className="type-label text-ink-700">In development</p>
      </div>
    </main>
  );
};
