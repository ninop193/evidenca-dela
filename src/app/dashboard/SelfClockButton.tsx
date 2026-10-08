"use client";

import { useState, useTransition } from "react";
import { addSelfAsEmployee } from "./actions";

// Delodajalca vpiše v evidenco zaposlenih (če še ni) in ga odpelje na žigosanje.
export function SelfClockButton({
  className,
  children,
  pendingLabel,
}: {
  className?: string;
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await addSelfAsEmployee();
            if (res.error) {
              setError(res.error);
              return;
            }
            window.location.assign("/zigosanje");
          })
        }
        className={className}
      >
        {pending && pendingLabel ? pendingLabel : children}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
