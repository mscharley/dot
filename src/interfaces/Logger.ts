/**
 * @public
 */
export type LoggerLevel = 'info' | 'debug' | 'trace';

/**
 * @public
 */
export type Logger = Record<
	LoggerLevel,
	{
		(obj: Record<string, unknown>, message: string): void;
		(msg: string): void;
	}
>;
