import {
  PayloadActionCreator,
  createAction as reduxCreateAction,
} from '@reduxjs/toolkit';
import { CreateActionCallback } from 'common/types/types';
import { ActionType } from 'store/modules/action-type';

type CreateAction = {
  (actionType: ActionType): PayloadActionCreator<void, ActionType>;
  <T, K>(
    actionType: ActionType,
    func: CreateActionCallback<T, K>,
  ): PayloadActionCreator<
    ReturnType<CreateActionCallback<T, K>>['payload'],
    ActionType,
    CreateActionCallback<T, K>
  >;
};

const createAction: CreateAction = <T, K>(
  actionType: ActionType,
  func?: CreateActionCallback<T, K>,
): any => {
  if (func) {
    return reduxCreateAction<CreateActionCallback<T, K>, ActionType>(
      actionType,
      func,
    );
  }
  return reduxCreateAction<void, ActionType>(actionType);
};

export { createAction };
