export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };

  return date.toLocaleDateString('en-US', options);
};

// Example usage:
// formatDate("2025-11-21") => "Nov 21, 2025"
