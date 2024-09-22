export default abstract class Database<T> {
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract getClient(): Awaited<T>;
    abstract setClient(client: T): void;
}