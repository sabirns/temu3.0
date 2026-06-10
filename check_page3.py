import json, urllib.request

API = "http://localhost/sabir/mu/wp-json/wp/v2"

def fetch(path):
    try:
        resp = urllib.request.urlopen(f"{API}/{path}")
        return json.loads(resp.read())
    except Exception as e:
        print(f"  Error: {e}")
        return None

# Get English page ID 8
p = fetch("pages/8?_embed=true&lang=en")
if p:
    print(f"=== English version (ID 8) ===")
    print(f"Title: {p['title']['rendered']}")
    print(f"Slug: {p['slug']}")
    print(f"Parent: {p['parent']}")
    print(f"Link: {p.get('link', 'N/A')}")
    print(f"Content length: {len(p['content']['rendered'])}")
    
    # Check children
    children = fetch(f"pages?parent=8&_embed=true&per_page=50&lang=en")
    if children:
        print(f"\nChildren ({len(children)}):")
        for c in children:
            embed = c.get('_embedded', {})
            media = embed.get('wp:featuredmedia', [])
            img = media[0]['source_url'] if media else 'NO IMAGE'
            print(f"  - {c['id']}: {c['title']['rendered']} (slug: {c['slug']})")
            print(f"    Image: {img}")
    
    # Also check translations of the English page
    trans = p.get('translations', {})
    print(f"\ntranslations: {trans}")
else:
    print("Page ID 8 not found")

# Also try looking for a page with slug "our-courses" or "programs"
for slug in ['programs', 'our-courses', 'programmes', 'courses', 'academic-programmes']:
    res = fetch(f"pages?slug={slug}&lang=en")
    if res and len(res) > 0:
        print(f"\n=== Found via slug '{slug}' ===")
        print(f"ID: {res[0]['id']}, Title: {res[0]['title']['rendered']}")
