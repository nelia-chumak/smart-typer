import type { Middleware as RTKMiddleware } from '@reduxjs/toolkit';
import type { RootState } from '../root-state/root-state.type';

type AppMiddleware = RTKMiddleware<object, RootState>;

export type { AppMiddleware };
