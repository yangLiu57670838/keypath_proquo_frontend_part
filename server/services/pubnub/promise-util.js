// promise helper functions

/**
 * Retry a failing promise-returning operation up to n times.
 *
 * @param retryAfter Retry period in ms.
 * @param maximumRetries The number of times to retry. (0 == no retries.)
 * @param operation An operation that returns a promise.
 * @param onRetry An optional function that is called each time operation is about to be retried. Can be used for logging, etc.
 * @returns A promise of operation's result.
 */
export function retry(retryAfter, maximumRetries, operation, onRetry) {
  // adapted from http://stackoverflow.com/a/26694802
  return operation()
    .catch(err => {
      if (maximumRetries <= 0) throw err;

      onRetry && onRetry(err);
      return delay(retryAfter).then(() => retry(retryAfter, maximumRetries - 1, operation, onRetry));
    });
}

export function delay(period) {
  return new Promise((resolve, reject) => setTimeout(resolve, period));
}
