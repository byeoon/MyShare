export interface Note {
    id: number;
    userId: number;
    title: string;
    content: string;
    file?: string;
    tags?: { text: string; color?: string }[] | string;
}
