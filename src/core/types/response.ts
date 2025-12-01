export interface ResponseType<T> {
  data: T | null;
}

export interface PaginatedResponseType<T> {
  data: T[];
  meta: {
    page: number;
    totalPage: number;
    totalData: number;
  };
}

export interface ErrorResponseType {
  type: 'client_error' | 'server_error';
  code: string;
  errors: {
    detail: string;
    attr: string | null;
  }[];
  timestamp: string;
}

/* API RESPONSE */
export type ApiSuccessType<T> = (ResponseType<T> | PaginatedResponseType<T>) & {
  code: string;
  detail: string;
  timestamp: string;
};
export type ApiErrorType = ErrorResponseType;
