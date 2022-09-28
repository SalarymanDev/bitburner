
export class Stack<T> {
    private storage: T[] = [];

    push(item: T): void {
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    size(): number {
        return this.storage.length;
    }

    isEmpty(): boolean {
        return this.storage.length === 0;
    }

    peek(): T | undefined {
        return this.storage.length === 0 ? undefined : this.storage[this.storage.length - 1];
    }
}