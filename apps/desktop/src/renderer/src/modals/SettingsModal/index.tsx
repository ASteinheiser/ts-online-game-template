import { Checkbox, Label, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui';
import { useVideoSettings } from '../../VideoSettingsProvider';
import { ResolutionSelect } from './ResolutionSelect';
import { Versions } from './Versions';

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ isOpen, onOpenChange }: SettingsModalProps) => {
  const {
    isFullscreen,
    currentResolution,
    availableResolutions,
    refetchResolutions,
    changeFullscreen,
    changeResolution,
  } = useVideoSettings();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm w-full"
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="pt-2 font-pixel text-4xl text-muted-foreground">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-2 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <Label className="font-title text-xl">Fullscreen</Label>
            <Checkbox
              className="size-6"
              checked={isFullscreen}
              onCheckedChange={(checked) => changeFullscreen(Boolean(checked.valueOf()))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="font-title text-xl">Resolution</Label>
            <ResolutionSelect
              disabled={isFullscreen}
              availableResolutions={availableResolutions}
              currentResolution={currentResolution}
              onResolutionChange={changeResolution}
              // ensures we show the latest resolution options in case the user:
              // changed display settings or dragged the window to another monitor
              onOpenChange={(open) => {
                if (open) refetchResolutions();
              }}
            />
          </div>
        </div>

        <div className="w-20 h-[2px] bg-secondary mx-auto" />

        <DialogFooter>
          <Versions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
