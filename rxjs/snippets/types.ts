/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */

/* OPERATOR INTERFACES */

export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface OperatorFunction<T, R>
  extends UnaryFunction<Observable<T>, Observable<R>> {}

/** SUBSCRIPTION INTERFACES */

export interface Unsubscribale {
  unsubscribe(): void;
}

export interface SubscriptionLike extends Unsubscribale {
  unsubscribe(): void;
  readonly closed: boolean;
}

export interface Subscription extends Unsubscribale {
  unsubscribe(): void;
  readonly closed: boolean;
  add(teardown: TeardownLogic): void;
  remove(teardown: Exclude<TeardownLogic, void>): void;
}

export type TeardownLogic = Subscription | Unsubscribale | (() => void) | void;

/** OBSERVABLE INTERFACES */

export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribale;
}

export interface Observable<T> extends Subscribable<T> {
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription;
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
}

/** OBSERVER INTERFACES */

export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface NextObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> =
  | NextObserver<T>
  | ErrorObserver<T>
  | CompletionObserver<T>;

export interface SubjectLike<T> extends Observer<T>, Subscribable<T> {}
