import { Download, Image, Link } from 'lucide-react';
import { cn } from '#/lib/utils.ts';

type ExportBarProps = {
  hasImage: boolean;
  isExporting?: boolean;
  linkCopied?: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  className?: string;
};

const actionButtonClass = cn(
  'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm px-4 type-label',
  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
  'focus-visible:ring-ring',
);

export const ExportBar = ({
  hasImage,
  isExporting = false,
  linkCopied = false,
  onDownload,
  onCopyLink,
  className,
}: ExportBarProps) => {
  const downloadDisabled = !hasImage || isExporting;

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby="export-heading">
      <h2 id="export-heading" className="type-label text-foreground">
        Export
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadDisabled}
          aria-disabled={downloadDisabled}
          aria-describedby={downloadDisabled ? 'download-disabled-reason' : undefined}
          className={cn(
            actionButtonClass,
            'bg-primary text-primary-foreground',
            'hover:bg-teal-600',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {isExporting ? (
            'Exporting…'
          ) : (
            <>
              <Download className="size-4" aria-hidden="true" />
              Download PNG
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCopyLink}
          className={cn(
            actionButtonClass,
            'border border-border bg-background text-foreground',
            'hover:bg-muted',
          )}
          aria-live="polite"
        >
          <Link className="size-4" aria-hidden="true" />
          {linkCopied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      {!hasImage && (
        <p
          id="download-disabled-reason"
          className="flex items-start gap-2 type-label text-muted-foreground"
        >
          <Image className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Add an image to export.
        </p>
      )}

      <p className="type-label text-muted-foreground">
        The link shares only the frame settings — someone else can open it and add their own image.
      </p>
    </section>
  );
};
