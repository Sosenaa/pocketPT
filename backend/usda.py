import httpx 

def search_usda_foods(
        query,
        api_key,
        page=1,
        ingredients_only=False,
):
    search_body = {
        "query": query, 
        "pageSize": 20,
        "pageNumber": page,
    }

    if ingredients_only:
        search_body["dataType"] = ["Foundation", "SR Legacy"]

    response = httpx.post(
        "https://api.nal.usda.gov/fdc/v1/foods/search",
        headers={"Content-Type": "application/json", "X-Api-Key": api_key},
        json=search_body,
        timeout=15.0
    )   

    response.raise_for_status()
    return response.json()

def get_usda_food(food_id, api_key):
    response  = httpx.get(
        f"https://api.nal.usda.gov/fdc/v1/food/{food_id}",
        params={"api_key": api_key},
        timeout=15.0
    )
    response.raise_for_status()
    return response.json()