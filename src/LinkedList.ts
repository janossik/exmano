import { match, pathToRegexp } from 'path-to-regexp';
export class Node<H> {
  next: Node<H> | null = null;
  handler: H;
  constructor(handler: H) {
    this.handler = handler;
  }
}

export class LinkedList<H> {
  method: string;
  pathname: string;
  regexp: RegExp;
  head: Node<H> | null = null;
  tail: Node<H> | null = null;
  constructor(method: string, pathname: string, ...handlers: H[]) {
    this.method = method;
    this.pathname = pathname;
    this.regexp = pathToRegexp(pathname);
    this.prepend(...handlers);
  }
  append(...handlers: H[]) {
    for (const handler of handlers) {
      const knot = new Node(handler);
      if (this.head === null) {
        this.head = knot;
        this.tail = knot;
        continue;
      }
      this.tail!.next = knot;
      this.tail = knot;
    }
  }

  prepend(...handlers: H[]) {
    for (const handler of handlers.reverse()) {
      const knot = new Node(handler);
      if (this.head === null) {
        this.head = knot;
        this.tail = knot;
        continue;
      }
      knot.next = this.head;
      this.head = knot;
    }
  }

  checkPathname(pathname: string) {
    return this.regexp!.exec(pathname) !== null;
  }

  match(pathname: string) {
    return match(this.pathname, { decode: decodeURIComponent })(pathname);
  }

  *values() {
    let current = this.head;
    while (current !== null) {
      yield current.handler;
      current = current.next;
    }
  }
  *traverse() {
    let current = this.head;
    while (current !== null) {
      yield current;
      current = current.next;
    }
  }
}
