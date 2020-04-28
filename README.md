# TSTL-Singleton
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/singleton/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Downloads](https://img.shields.io/npm/dm/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Build Status](https://github.com/samchon/singleton/workflows/build/badge.svg)](https://github.com/samchon/singleton/actions?query=workflow%3Abuild)

## 1. Outline
Asynchronous Singleton Generator using [TSTL](https://github.com/samchon/tstl).

The `tstl-singleton` is an *Asynchronous Singleton Generator*, who guarantees the *asynchronous lazy constructor* to be called *"only one at time"*. The *"only one at time"* would always be kepted, even in the race condition, through [*Mutex*](https://tstl.dev/api/classes/std.mutex.html) and [*UniqueLock*](https://tstl.dev/api/classes/std.uniquelock.html) who are implemented in the [**TSTL**](https://github.com/samchon/tstl).




## 2. Installation
Installing `tstl-singleton` in *NodeJS* is very easy. Just install it using `NPM`.

```bash
npm install --save tstl-singleton
```

To use the `tstl-singleton`, import `Singleton` class and create the `Singleton` instance with your custom *lazy constructor*. After the creation, call the `Singleton.get()` method, then it would return the promised value with *lazy construction*.

```typescript
import { Singleton } from "tstl-singleton";
import { Member } from "./Member";

export namespace RemoteAssets
{
    export function getMembers(): Promise<Member[]>
    {
        return members_.get();
    }
    
    const members_: Singleton<Member[]> = new Singleton(() =>
    {
        let response: Response = await fetch("https://some-domain.com/members", {
            method: "GET"
        });
        return await response.json();
    });
}
```




## 3. Usage
### 3.1. Basic Concepts
```typescript
declare module "tstl-singleton"
{
    export class Singleton<T>
    {
        /**
         * Create singleton generator with the *lazy constructor*.
         */
        public constructor(getter: () => Promise<T>);
        
        /**
         * Get the *lazy constructed* value.
         */
        public get(): Promise<T>;

        /**
         * Reload value by calling the *lazy constructor* forcibly.
         */
        public reload(): Promise<T>;
    }
}
```

Using the `tstl-singleton` is very easy as well. Create a `Singleton` instance with your custom *lazy constructor* and get the promised value through the `Singleton.get()` method. The `Singleton.get()` method would construct the return value following the logic below:

  - At the first time: calls the *lazy constructor* and returns the value.
  - At the *lazy construction*: returns the pre-constructed value.
  - When race condition:
    - simultaneously call happens during the *lazy construction*.
    - guarantees the *"only one at time"* through a *mutex*.

If you want to reload the promised value, regardless of whether the *lazy construction* has been completed or not, call the `Singleton.reload()` method. It would call the *lazy constructor* forcibly, even if the *lazy construction* has been completed in sometime.

### 3.2. Demonstration
As previously mentioned, `tstl-singleton` always ensures the *lazy constructor* to be called *"only one at time"*. As you can see from the example code below, even simultaneous call on the `Singleton.get()` has been occcured, the *lazy constructor* would be called *"only one at time"*.

```typescript
import { Singleton } from "tstl-singleton";
import { randint } from "tstl/algorithm/random";
import { sleep_for } from "tstl/thread/global";

async function main(): Promise<void>
{
    // GENERATE SINGLETON WITH LAZY-CONSTRUCTOR 
    let index: number = 0;
    let singleton: Singleton<number> = new Singleton(async () =>
    {
        await sleep_for(randint(50, 500));
        return ++index;
    });

    // RACE CONDITIO: SIMULTANEOUS ACCESS
    let promises: Promise<number>[] = [];
    for (let i: number = 0; i < 5; ++i)
        promises.push( singleton.get() );
    
    // OUTPUT: ALL ELEMENTS MUST BE 1
    console.log(await Promise.all(promises));

    // RELOAD: WOULD BE 2
    console.log(await singleton.reload());
}
```
> ```bash
> 1 1 1 1 1
> 2
> ```

### 3.3. Sample Case
Loading remote data from the external API would be a heavy work for the remote server. Therefore, it would be better to call the external API, only when it's required. In such reason, loading remote data from the external API can be the best use case for the `tstl-singleton`.

With the *lazy constructor*, you can call the external API only when you need it. Also, you can avoid the vulnerable API callings by using the `Singleton.get()` method in the race condition, which helps you to call the external API *"only one at time"*.

Look at the below code and feel what the *"only one at time"* means:

```typescript
import { Singleton } from "tstl-singleton";

import { Company } from "./Company";
import { Member } from "./Member";

export namespace RemoteAssets
{
    export function getCompanies(): Promise<Company[]> 
    {
        return companies_.get();
    }
    export function getMembers(): Promise<Member[]>
    {
        return members_.get();
    }

    async function fetchItems<Entity>(path: string): Promise<Entity[]>
    {
        let url: string = `https://some-domain.com${path}`;
        let response: Response = await fetch(url, { method: "GET" });
        return await response.json();
    }
    const companies_: Singleton<Company[]> = new Singleton(() => fetchItems("/companies"));
    const members_: Singleton<Member[]> = new Singleton(() => fetchItems("/members"));
}
```
