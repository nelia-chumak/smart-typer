interface IPaginationResponse<T> {
  count: number;
  data: T[];
}

export type { IPaginationResponse };
