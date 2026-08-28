import { Download, Image, Link } from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils.ts';

type ExportBarProps = {
  hasImage: boolean;
  isExporting?: boolean;
  linkCopied?: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  className?: string;
};

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
        <Button
          variant="default"
          className="flex-1"
          onClick={onDownload}
          disabled={downloadDisabled}
          aria-disabled={downloadDisabled}
          aria-describedby={downloadDisabled ? 'download-disabled-reason' : undefined}
        >
          {isExporting ? (
            'Exporting…'
          ) : (
            <>
              <Download className="size-4" aria-hidden="true" />
              Download PNG
            </>
          )}
        </Button>

        <Button variant="outline" className="flex-1" onClick={onCopyLink} aria-live="polite">
          <Link className="size-4" aria-hidden="true" />
          {linkCopied ? 'Copied' : 'Copy link'}
        </Button>
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
