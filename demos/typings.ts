export type FilterType = 'all'|'unfinished'|'finished';

export interface TodoItem {
    finished: boolean;
    text: string;
    id: string;
}