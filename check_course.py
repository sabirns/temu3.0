import json, urllib.request

API = "http://localhost/sabir/mu/wp-json/wp/v2"

def fetch(path):
    try:
        resp = urllib.request.urlopen(f"{API}/{path}")
        return json.loads(resp.read())
    except Exception as e:
        print(f"  Error: {e}")
        return None

# Check PG child page (ID 2102) for ACF fields
p = fetch("pages/2102?_embed=true&acf_format=standard")
if p:
    print(f"=== Page 2102 ===")
    print(f"Title: {p['title']['rendered']}")
    print(f"Slug: {p['slug']}")
    acf = p.get('acf', {})
    print(f"\nACF keys: {list(acf.keys())}")
    for k, v in acf.items():
        print(f"  {k}: {type(v).__name__} = {str(v)[:200]}")
else:
    print("Page 2102 not found")

# Also check PhD page
p2 = fetch("pages/2105?_embed=true&acf_format=standard")
if p2:
    print(f"\n=== Page 2105 ===")
    print(f"Title: {p2['title']['rendered']}")
    acf = p2.get('acf', {})
    print(f"ACF keys: {list(acf.keys())}")
    for k, v in acf.items():
        print(f"  {k}: {type(v).__name__} = {str(v)[:200]}")

# Check the courses post type
print(f"\n=== Courses post type ===")
courses = fetch("courses?per_page=3&_embed=true")
if courses is not None:
    print(f"Found {len(courses)} courses")
    if courses:
        print(f"First course keys: {list(courses[0].keys())}")
        print(f"Title: {courses[0]['title']['rendered']}")
        # Check what taxonomy fields exist
        for k in courses[0]:
            if 'tax' in k.lower() or 'cat' in k.lower() or 'course' in k.lower():
                print(f"  Field '{k}': {courses[0][k]}")

# Check the course_category taxonomy
print(f"\n=== Course Categories ===")
cats = fetch("course_category?per_page=5")
if cats is not None:
    print(f"Found {len(cats)} categories")
    for c in cats:
        print(f"  {c['id']}: {c['name']} (slug: {c['slug']})")
