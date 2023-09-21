/**
 * Log levels required for the container to log messages
 *
 * @public
 */
export type LoggerLevel = 'warn' | 'info' | 'debug' | 'trace';

/**
 * The function signature to support for writing a log message.
 *
 * @public
 */
export type LoggerFn = {
	(obj: Record<string, unknown>, message?: string): void;
	(message: string): void;
};

/**
 * A valid logger object to be used by the container
 *
 * @remarks
 *
 * This is intended to be a reasonably generalised logging definition that is directly interoperable with many different
 * logging frameworks. If your favourite logging framework isn't supported then please open an issue and we'll look into
 * it.
 *
 * As a minimal option, the global console object is compatible with this interface if you aren't already using another
 * supported logging framework.
 *
 * @public
 */
export type Logger = Record<LoggerLevel, LoggerFn>;
