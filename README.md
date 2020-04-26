# TSTL-Singleton
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/singleton/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Downloads](https://img.shields.io/npm/dm/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Build Status](https://github.com/samchon/singleton/workflows/build/badge.svg)](https://github.com/samchon/singleton/actions?query=workflow%3Abuild)

## Outline
Asynchronous Singleton Generator using [TSTL](https://github.com/samchon/tstl).

The `tstl-singleton` is an *Asynchronous Singleton Generator*, who guarantees the *asynchronous lazy constructor* to be called *"only one at time"*. The *"only one at time"* would always be kepted, even in the race condition, through Mutex and UniqueLock who are imlemented in the [TSTL](https://github.com/samchon/tstl).




## Installation
Installing `tstl-singleton` in *NodeJS* is very easy. Just install with the `npm`

```bash
npm install --save tstl-singleton
```



## Usage
### Definition
```typescript
declare module "tstl-singleton"
{
    export class Singleton<T>
    {
        public constructor(getter: () => Promise<T>);
        
        public get(): Promise<T>;
        public reload(): Promise<T>;
    }
}
```

### Demonstration
As you've seen, `tstl-singleton` always ensures the *lazy constructor* to be called *"only one at time"*. As you can see from the below example code, even simultaneous call on the `Singleton.get()` occcurs, the *lazy constructor* would be called *"only one at time"*.

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
    for (let i: number = 0; i < 10; ++i)
        promises.push( singleton.get() );
    
    // OUTPUT: ALL ELEMENTS MUST BE 1
    console.log(await Promise.all(promises));

    // RELOAD: WOULD BE 2
    console.log(await singleton.reload());
}
```
> ```bash
> 1 1 1 1 1 1 1 1 1 1 1
> 2
> ```

### Sample Case
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
        let url: string = "http://some-domain.com/" + path;
        let response: Response = await fetch(url, { method: "GET" });
        return await response.json();
    }
    const companies_: Singleton<Company[]> = new Singleton(() => fetchItems("/companies"));
    const members_: Singleton<Member[]> = new Singleton(() => fetchItems("/members"));
}
```


