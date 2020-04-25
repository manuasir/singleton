import { Mutex } from "tstl/thread/Mutex";
import { UniqueLock } from "tstl/thread/UniqueLock";

/**
 * Singleton Generator
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export class Singleton<T>
{
    private getter_: () => Promise<T>;
    private mutex_: Mutex;    
    private value_: T | object;

    public constructor(getter: () => Promise<T>)
    {
        this.getter_ = getter;
        this.mutex_ = new Mutex();
        this.value_ = NOT_MOUNTED_YET;
    }

    public async get(): Promise<T>
    {
        if (this.value_ === NOT_MOUNTED_YET)
            await UniqueLock.lock(this.mutex_, async () =>
            {
                if (this.value_ !== NOT_MOUNTED_YET)
                    return;

                this.value_ = await this.getter_();
            });
        return this.value_ as T;
    }
}

const NOT_MOUNTED_YET = {};