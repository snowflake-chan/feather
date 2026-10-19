export type QueryType = { [name: string]: any };

export interface Non200Error {
  non200: true;
  method: string;
  url: string;
  data?: any; // the data the request intended to send

  status: string; // returned http status code
  res: string; // returned http status message
}

export function isNon200Error(e: any): e is Non200Error {
  return e !== undefined && e.non200 === true;
}

/**
 * If we get a proper response, but it is not status 200, a Non200Error object
 * will be thrown.
 */
export interface FetchAPI {
  post(url: string, body: { [name: string]: any }): Promise<string>;
  get(url: string, query?: QueryType): Promise<string>;
}
