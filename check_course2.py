import json, urllib.request

API = "http://localhost/sabir/mu/wp-json/wp/v2"

def fetch(path):
    try:
        resp = urllib.request.urlopen(f"{API}/{path}")
        return json.loads(resp.read())
    except Exception as e:
        print(f"  Error: {e}")
        return None

# Check the English child pages
for pid in [13198, 1926, 1347]:
    p = fetch(f"pages/{pid}?_embed=true&acf_format=standard&lang=en")
    if p:
        print(f"=== Page {pid}: {p['title']['rendered']} ===")
        print(f"  Slug: {p['slug']}")
        print(f"  ACF: {json.dumps(p.get('acf', {}), ensure_ascii=False)[:300]}")
    else:
        print(f"Page {pid} not found")

# Check courses by course_category term
print(f"\n=== Courses in category 12 (MA Courses) ===")
courses = fetch("courses?course_category=12&per_page=5&_embed=true")
if courses:
    print(f"Found {len(courses)} courses")
    for c in courses:
        print(f"  - {c['id']}: {c['title']['rendered']}")

print(f"\n=== Courses in category 14 (Ph.D) ===")
courses = fetch("courses?course_category=14&per_page=5&_embed=true")
if courses:
    print(f"Found {len(courses)} courses") 
    for c in courses:
        embed = c.get('_embedded', {})
        media = embed.get('wp:featuredmedia', [])
        img = media[0].source_url if media else 'none'
        print(f"  - {c['id']}: {c['title']['rendered']}")
        print(f"    Featured image: {img[:100] if img else 'none'}")

# Check English category names
print(f"\n=== All course categories (EN) ===")
cats = fetch("course_category?per_page=20&lang=en")
if cats:
    for c in cats:
        print(f"  {c['id']}: {c['name']} (slug: {c['slug']})")
