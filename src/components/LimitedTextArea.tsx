import React, { useCallback, useState } from 'react';

interface LimitedTextAreaProps {
  id?: string;
  name?: string;
  classes?: string;
  value: string;
  setValue: (content: string) => void;
  rows?: number;
  cols?: number;
  limit: number;
  placeholder?: string;
  disabled?: boolean;
}

const LimitedTextarea = ({ id, name, classes, value, setValue, rows, cols, limit, placeholder, disabled = false }: LimitedTextAreaProps) => {
  const [] = useState(value.slice(0, limit));

  const setFormattedContent = useCallback(
    text => {
      setValue(text.slice(0, limit));
    },
    [limit, setValue]
  );

  return (
    <>
      <textarea
        id={id}
        name={name}
        rows={rows}
        cols={cols}
        className={classes}
        onChange={event => setFormattedContent(event.target.value)}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
      />
      <span className="flex justify-end text-xs font-thin text-gray-500">
        {value.length}/{limit}
      </span>
    </>
  );
};

export default LimitedTextarea