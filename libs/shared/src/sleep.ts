export async function sleep(ms = 1500) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
