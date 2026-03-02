export function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    return 'id,email,created_at,referrer,user_agent\n';
  }

  const headers = ['id', 'email', 'created_at', 'referrer', 'user_agent'];
  const escape = (value: unknown) => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(','));
  return `${headers.join(',')}\n${lines.join('\n')}\n`;
}
