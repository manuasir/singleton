# TSTL-Singleton
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/tstl-singleton/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Downloads](https://img.shields.io/npm/dm/tstl-singleton.svg)](https://www.npmjs.com/package/tstl-singleton)
[![Build Status](https://github.com/samchon/tstl-singleton/workflows/build/badge.svg)](https://github.com/samchon/tstl-singleton/actions?query=workflow%3Abuild)

TSTL-Singleton is a *Lazy Singleton Generator* based on `Promise` through the [TSTL](https://github.com/samchon/tstl).

```typescript
declare module "tstl-singleton"
{
    export class Singleton<T>
    {
        public constructor(getter: () => Promise<T>);

        public get(): Promise<T>;
    }
}
```

```typescript
import { Singleton } from "tstl-singleton";

import { Company } from "./Company";
import { Member } from "./Member";
import { History } from "./History";

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
    export function getHistories(): Promise<History[]> 
    {
        return histories_.get();
    }

    const companies_: Singleton<Company[]> = new Singleton(() => fetchItems("/companies"));
    const members_: Singleton<Member[]> = new Singleton(() => fetchItems("/members"));
    const histories_: Singleton<History[]> = new Singleton(() => fetchItems("/histories"));

    async function fetchItems<Entity>(path: string): Promise<Entity[]>
    {
        let url: string = "http://some-domain.com/" + path;
        let response: Response = await fetch(url, { method: "GET" });
        return await response.json();
    }
}
```