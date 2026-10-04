import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { AppError } from "../../types/errors";

type Props = {
  onSubmit: (url: string) => void;
  error: AppError | null;
};

export function UrlInputForm({ onSubmit, error }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    onSubmit(value.trim());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <label className="text-sm font-medium text-text-muted" htmlFor="youtube-url">
        YouTube URL
      </label>
      <div className="flex flex-wrap gap-[var(--space-sm)]">
        <input
          id="youtube-url"
          className="min-w-0 flex-[1_1_10rem] rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-text"
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="ui-filled shrink-0 px-4 py-2.5 font-semibold"
          onClick={submit}
        >
          Load
        </button>
      </div>
      {error ? (
        <p className="m-0 text-sm text-danger" role="alert">
          {error.message}
          {import.meta.env.DEV && error.debug ? (
            <span className="text-text-muted"> ({error.debug})</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
