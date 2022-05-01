import { Mockjs } from 'mockjs';

declare module '*.svg';

declare global {
  const Mock: Mockjs;
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function
  }
}