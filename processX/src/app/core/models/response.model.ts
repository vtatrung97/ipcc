export interface ResponseEnvelope<T = any> {
  status: string;
  code?: number;
  message?: string;
  data: T;
  total?: number;
}
