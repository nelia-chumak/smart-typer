import * as reducers from "store/modules/reducers";

type ReducersMap = typeof reducers;

export type RootState = {
  [K in keyof ReducersMap]: ReturnType<ReducersMap[K]>;
};
