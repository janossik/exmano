import path from 'path';

export function preparePathname(...pathname: string[]) {
  let currentPathname = path.normalize(path.join(...pathname));
  currentPathname = currentPathname.endsWith('/') ? currentPathname.slice(0, -1) : currentPathname;
  return currentPathname;
}
