export const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

export const getUserAgent = (req: any): string => {
  return req.headers['user-agent'] || 'unknown';
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
