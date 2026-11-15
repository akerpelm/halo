import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { CloseIcon } from '../icons/close-icon';
import { TimerRing } from '../icons/timer-ring';
import { TypeIcon } from '../icons/type-icon';
import type { ToastRecord } from '../store/toast-store';
import { useToasterContext } from '../toaster/toaster-context';
import type { ToastTimer } from '../types';

const TYPE_LABEL: Record<ToastRecord['type'], string> = {
  default: '',
  success: 'Success:',
  error: 'Error:',
  warning: 'Warning:',
  info: 'Info:',
  loading: 'In progress:',
};

export type Ring = ToastTimer | 'action';

type ToastContentProps = {
  toast: ToastRecord;
  icon: ReactNode;
  duration: number;
  ring: Ring;
  dismissible: boolean;
  onDismiss: () => void;
};

export function ToastContent({ toast: t, icon, duration, ring, dismissible, onDismiss }: ToastContentProps) {
  const { classNames, closeButton } = useToasterContext();
  const timerRing = <TimerRing duration={duration} restartKey={t.revision} />;

  return (
    <>
      {(icon || ring === 'icon') && (
        <span key={t.type} className={cx('halo-toast-icon', classNames?.icon)} data-timer={ring === 'icon' || undefined}>
          {ring === 'icon' && timerRing}
          {icon}
        </span>
      )}
      <div className="halo-toast-text">
        {TYPE_LABEL[t.type] && <span className="halo-sr-only">{TYPE_LABEL[t.type]} </span>}
        <div className={cx('halo-toast-title', classNames?.title)}>
          {t.title}
          {t.count > 1 && (
            <span key={t.count} className="halo-toast-count">
              <span className="halo-sr-only">, </span>
              {t.count}
              <span className="halo-sr-only"> times</span>
            </span>
          )}
        </div>
        {t.description && <div className={cx('halo-toast-description', classNames?.description)}>{t.description}</div>}
      </div>
      {t.action && (
        <button
          type="button"
          className={cx('halo-toast-action', classNames?.action)}
          data-timer={ring === 'action' || undefined}
          onClick={(event) => {
            t.action?.onClick(event);
            if (!event.defaultPrevented) onDismiss();
          }}
        >
          {ring === 'action' && (
            <span aria-hidden className="halo-action-ring">
              {timerRing}
            </span>
          )}
          {t.action.label}
        </button>
      )}
      {closeButton && dismissible ? (
        <button type="button" className={cx('halo-toast-close', classNames?.close)} data-timer={ring === 'close' || undefined} aria-label="Dismiss notification" onClick={onDismiss}>
          {ring === 'close' && timerRing}
          <CloseIcon />
        </button>
      ) : (
        ring === 'close' && (
          <span className="halo-toast-close" data-timer="" aria-hidden>
            {timerRing}
          </span>
        )
      )}
    </>
  );
}

export function iconFor(t: ToastRecord, icons: boolean): ReactNode {
  if (t.icon) return t.icon;
  return t.type === 'default' || !icons ? null : <TypeIcon type={t.type} />;
}

export function ringFor(t: ToastRecord, timed: boolean, hasIcon: boolean, timer: ToastTimer): Ring {
  if (!timed) return false;
  if (t.undo && t.action) return 'action';
  if (timer === 'icon' && !hasIcon) return 'close';
  return timer;
}
