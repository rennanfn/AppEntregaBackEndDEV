export default function convertLowerCase<T>(obj: T): T {
  // eslint-disable-next-line consistent-return
  function reviver(this: T, key: string, value: any): any {
    const keyLower = key.toLocaleLowerCase();
    if (key === keyLower) return value;
    this[keyLower as keyof T] = value;
  }

  return JSON.parse(JSON.stringify(obj), reviver);
}
