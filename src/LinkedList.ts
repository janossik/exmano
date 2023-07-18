import { match, pathToRegexp } from 'path-to-regexp';
import { Handler } from './types';
export class Node {
  next: Node | null = null;
  handler: Handler;
  constructor(handler: Handler) {
    this.handler = handler;
  }
}

export class LinkedList {
  method: string;
  pathname: string;
  regexp: RegExp;
  head: Node | null = null;
  tail: Node | null = null;
  constructor(method: string, pathname: string, ...handlers: Handler[]) {
    this.method = method;
    this.pathname = pathname;
    this.regexp = pathToRegexp(pathname);
    this.prepend(...handlers);
  }
  append(...handlers: Handler[]) {
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

  prepend(...handlers: Handler[]) {
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
