import { Singleton } from "../Singleton";

export namespace RemoteAssets
{
    const companies_: Singleton<Company[]> = new Singleton(() => fetchItems("/companies"));
    const members_: Singleton<Member[]> = new Singleton(() => fetchItems("/members"));
    const histories_: Singleton<History[]> = new Singleton(() => fetchItems("/histories"));

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

    async function fetchItems<Entity>(path: string): Promise<Entity[]>
    {
        let url: string = "http://some-domain.com/" + path;
        let response: Response = await fetch(url, { method: "GET" });
        return await response.json();
    }
}

type Company = object;
type Member = object;
type History = object;