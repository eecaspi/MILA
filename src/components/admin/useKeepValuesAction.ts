"use client";

import { useActionState, useTransition, type FormEvent } from "react";

/**
 * Like useActionState, but the form is NOT reset after submitting. React 19 clears
 * every field after a form action finishes, which wipes what was typed when the
 * server answers with validation errors. Submitting by hand keeps the values.
 */
export function useKeepValuesAction<S>(
  action: (prev: Awaited<S>, formData: FormData) => Promise<S>,
  initial: Awaited<S>,
) {
  const [state, run] = useActionState(action, initial);
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(() => {
      run(data);
    });
  };
  return { state, pending, onSubmit };
}
