export interface ITodo {
  id: number;
  title: string;
  description: string;
  isComplete?: boolean;
}

export type InfiniteQueryResponse<T = any, P = any> = {
  pages: T[];
  pageParams: P[];
};
