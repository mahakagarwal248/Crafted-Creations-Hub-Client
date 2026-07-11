import { useEffect, useState } from 'react';

/** Show a busy indicator only after `delayMs` to avoid flashing on fast/cache hits. */
export function useDelayedBusy(isBusy, delayMs = 220) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isBusy) {
      setShow(false);
      return undefined;
    }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [isBusy, delayMs]);

  return show;
}
