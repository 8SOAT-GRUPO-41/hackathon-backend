import type { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';

/**
 * Controller interface that can be used for HTTP requests and responses but also supports
 * other types of inputs and outputs, such as commands, SQS messages, etc.
 */
export interface Controller<I = HttpRequest, O = HttpResponse> {
  handle(input: I): Promise<O>;
}
