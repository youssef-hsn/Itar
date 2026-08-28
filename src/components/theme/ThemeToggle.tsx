import { Moon, Sun } from 'lucide-react';
import { buttonVariants } from '#/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx';
import { setTheme, type Theme } from '#/lib/theme.ts';
import { cn } from '#/lib/utils.ts';
import { useTheme } from './useTheme.ts';

export const ThemeToggle = () => {
  const theme = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        aria-label="Change theme"
      >
        <Sun className="size-4 dark:hidden" aria-hidden="true" />
        <Moon className="hidden size-4 dark:block" aria-hidden="true" />
        <span className="sr-only">Change theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(val: Theme) => {
            setTheme(val);
          }}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
