import json, sys, urllib.request, os
slug = "2025-%E0%B4%A8%E0%B4%B5%E0%B4%82%E0%B4%AC%E0%B5%BC-5-%E0%B4%AA%E0%B5%81%E0%B4%B8%E0%B5%8D%E0%B4%A4%E0%B4%95-%E0%B4%AA%E0%B5%8D%E0%B4%B0%E0%B4%95%E0%B4%BE%E0%B4%B6%E0%B4%A8%E0%B4%82"
url = f"http://localhost/sabir/mu/wp-json/wp/v2/galleries?slug={slug}&_embed=true&_t={int(__import__('time').time())}"
try:
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read())
    if not data:
        print("No data returned")
        sys.exit(1)
    item = data[0]
    acf = item.get("acf", {})
    print("=== ACF keys ===")
    for k in acf:
        print(f"  {k}: {type(acf[k]).__name__}")
    if "gallery" in acf:
        gal = acf["gallery"]
        print(f"\ngallery type: {type(gal).__name__}, len: {len(gal) if isinstance(gal, list) else 'N/A'}")
        if isinstance(gal, list) and len(gal) > 0:
            first = gal[0]
            print(f"\nFirst item type: {type(first).__name__}")
            if isinstance(first, dict):
                print(f"Keys: {list(first.keys())}")
                for k, v in first.items():
                    print(f"  {k} ({type(v).__name__}): {str(v)[:120]}")
    else:
        print("\nNo 'gallery' field in ACF")
        print(json.dumps(acf, indent=2, ensure_ascii=False)[:3000])
except Exception as e:
    print(f"Error: {e}")
