export const debug = {
  info(message: string) {
    console.log(`\x1b[34m${message}`);
  },
  warn(message: string) {
    console.log(`\x1b[33m${message}`);
  },
  error(message: string) {
    console.log(`\x1b[31m${message}`);
  },
  success(message: string) {
    console.log(`\x1b[32m${message}`);
  },
};
