import httpx
import asyncio

async def test():
    async with httpx.AsyncClient(headers={'User-Agent': 'Mozilla/5.0'}) as client:
        r = await client.get('https://query2.finance.yahoo.com/v1/finance/search?q=apple&quotesCount=5&newsCount=0')
        print(r.json())

asyncio.run(test())
