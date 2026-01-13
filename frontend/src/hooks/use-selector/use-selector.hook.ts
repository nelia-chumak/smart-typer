import { RootState } from 'common/types/types';
import {
  TypedUseSelectorHook,
  shallowEqual,
  useSelector as useReduxSelector,
} from 'react-redux';

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const useShallowSelector: TypedUseSelectorHook<RootState> = (selector) =>
  useReduxSelector(selector, shallowEqual);

export { useSelector, useShallowSelector };
