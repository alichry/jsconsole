/**
 * @param  {...(string | undefined | null | false)} classNames
 * @returns
 */
export function cn(...classNames) {
  return classNames.filter(n => typeof n === 'string').join(' ');
}