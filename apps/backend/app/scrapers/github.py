import httpx

from app.config import settings


async def scrape_github(username: str) -> list[dict]:
    proxies = settings.proxy_url if settings.proxy_url else None
    async with httpx.AsyncClient(proxy=proxies) as client:
        response = await client.get(
            f"https://api.github.com/users/{username}/repos"
        )
        response.raise_for_status()
        repos = response.json()

    return [
        {
            "description": repo.get("description"),
            "name": repo["name"],
            "fullName": repo["full_name"],
            "starCount": repo["stargazers_count"],
        }
        for repo in repos
    ]
