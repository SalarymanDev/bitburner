export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
    isEmpty(): boolean;
}

export class Queue<T> implements IQueue<T> {
    private storage: T[] = [];

    enqueue(item: T): void {
        this.storage.push(item);
    }

    dequeue(): T | undefined {
        return this.storage.shift();
    }

    size(): number {
        return this.storage.length;
    }

    isEmpty(): boolean {
        return this.storage.length === 0;
    }

    peek(): T | undefined {
        return this.storage.length > 0 ? this.storage[0] : undefined;
    }
}