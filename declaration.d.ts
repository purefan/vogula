import Mithril from "mithril";

declare module '*.scss';
declare module '*.css';

declare global {
    const m: typeof Mithril
}