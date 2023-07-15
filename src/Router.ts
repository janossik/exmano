import { ManagerRequestEmitter } from './Manage-request-emitter';

export class Router extends ManagerRequestEmitter {
  pathname: string;
  constructor(path = '/') {
    super();
    this.pathname = path;
  }
}
