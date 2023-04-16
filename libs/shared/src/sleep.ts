export async function sleep(ms = 500) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
