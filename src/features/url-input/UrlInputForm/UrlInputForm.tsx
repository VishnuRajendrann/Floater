import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { AppError } from "../../../types/errors";
import styles from "./UrlInputForm.module.css";

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
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="youtube-url">
        YouTube URL
      </label>
      <div className={styles.row}>
        <input
          id="youtube-url"
          className={styles.input}
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" className={styles.button} onClick={submit}>
          Load
        </button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error.message}
          {import.meta.env.DEV && error.debug ? (
            <span className={styles.debug}> ({error.debug})</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
