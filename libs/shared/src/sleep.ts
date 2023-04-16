export async function sleep(ms = 350) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
