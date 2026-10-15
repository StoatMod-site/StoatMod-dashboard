/** Renders "1 case" / "3 cases" as one text node so each phrase can be translated as a whole ("{0} case" / "{0} cases"). */
export function pluralize(count: number, one: string, other: string): string {
  return `${count} ${count === 1 ? one : other}`;
}
