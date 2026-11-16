import React from 'react';
import { Link } from 'react-router-dom';

const FormattedText = ({ text = '', className = '' }) => {
  if (!text) return null;

  // Split text into tokens by whitespace while keeping structure
  const tokens = text.split(/(\s+)/);

  return (
    <p className={`whitespace-pre-line leading-relaxed ${className}`}>
      {tokens.map((token, index) => {
        if (/^#[a-zA-Z0-9_]+$/.test(token)) {
          const tag = token.substring(1);
          return (
            <Link
              key={index}
              to={`/search?q=${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {token}
            </Link>
          );
        }
        if (/^@[a-zA-Z0-9_]+$/.test(token)) {
          const username = token.substring(1);
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
            >
              {token}
            </Link>
          );
        }
        return token;
      })}
    </p>
  );
};

export default FormattedText;
