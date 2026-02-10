export const jwtConfig = {
  secret:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error('JWT_SECRET env variable is required');
    })(),
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
