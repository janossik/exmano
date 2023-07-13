import { EventEmitter } from 'events';
import { Handler } from './types';

export class Router extends EventEmitter {
  middlewares: Array<Handler> = [];
}
