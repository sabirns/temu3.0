import json, urllib.request

API = "http://localhost/sabir/mu/wp-json/wp/v2"

def fetch(path):
    try:
        resp = urllib.request.urlopen(f"{API}/{path}")
        return json.loads(resp.read())
    except Exception as e:
        print(f"  Error: {e}")
        return None

# Check translations of ID 443
page = fetch("pages/443?_embed=true")
if page:
    links = page.get('_links', {})
    trans = links.get('translations', [])
    print(f"Translations for ID 443:")
    for t in trans:
        print(f"  {t['lang']}: {t['href']}")
    
    # Also check translations field
    trans_field = page.get('translations', page.get('pll_translations', {}))
    print(f"\ntranslations field: {trans_field}")

# Try finding English page with different slug
for slug in ['courses', 'our-courses', 'programs', 'programs-en', 'our-courses-en', 'academic-programs']:
    res = fetch(f"pages?slug={slug}&_embed=true&lang=en")
    if res and len(res) > 0:
        p = res[0]
        print(f"\n=== Found: {slug} ===")
        print(f"ID: {p['id']}, Title: {p['title']['rendered']}, Parent: {p['parent']}")
        break

# List top-level pages in English
print("\n=== English top-level pages ===")
all_pages = fetch("pages?per_page=100&lang=en&_fields=id,title,slug,parent")
if all_pages:
    for p in all_pages:
        print(f"  {p['id']}: {p['title']['rendered']} (slug: {p['slug']}, parent: {p['parent']})")
