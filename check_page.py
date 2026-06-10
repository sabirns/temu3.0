import json, urllib.request

API = "http://localhost/sabir/mu/wp-json/wp/v2"

def fetch(path):
    url = f"{API}/{path}"
    try:
        resp = urllib.request.urlopen(url)
        return json.loads(resp.read())
    except Exception as e:
        print(f"  Error: {e}")
        return None

# 1. Find the page by slug
page = fetch("pages?slug=our-courses-ml&_embed=true")
if page:
    p = page[0]
    print(f"=== our-courses-ml ===")
    print(f"ID: {p['id']}")
    print(f"Title: {p['title']['rendered']}")
    print(f"Parent: {p['parent']}")
    print(f"Slug: {p['slug']}")
    
    # Check for translated version
    links = p.get('_links', {})
    if 'translations' in links:
        print(f"\nTranslations:")
        for t in links['translations']:
            print(f"  {t['lang']}: {t['href']}")
    
    # 2. Find child pages
    print(f"\n=== Children of ID {p['id']} ===")
    children = fetch(f"pages?parent={p['id']}&_embed=true&per_page=50")
    if children:
        print(f"Found {len(children)} children")
        for c in children:
            embed = c.get('_embedded', {})
            media = embed.get('wp:featuredmedia', [])
            img = media[0]['source_url'] if media else 'NO IMAGE'
            print(f"  - {c['id']}: {c['title']['rendered']} (slug: {c['slug']})")
            print(f"    Image: {img}")
    else:
        print("No children found or error")
else:
    print("Page not found")

# 3. Also check English version
print(f"\n=== English version ===")
en = fetch("pages?slug=our-courses&_embed=true")
if en:
    p = en[0]
    print(f"ID: {p['id']}")
    print(f"Title: {p['title']['rendered']}")
    print(f"Parent: {p['parent']}")
    children = fetch(f"pages?parent={p['id']}&_embed=true&per_page=50")
    if children:
        print(f"Children ({len(children)}):")
        for c in children:
            embed = c.get('_embedded', {})
            media = embed.get('wp:featuredmedia', [])
            img = media[0]['source_url'] if media else 'NO IMAGE'
            print(f"  - {c['id']}: {c['title']['rendered']} (slug: {c['slug']})")
            print(f"    Image: {img}")
