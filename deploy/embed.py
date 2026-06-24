import base64, re, os

deploy_dir = os.path.dirname(os.path.abspath(__file__))

def file_to_data_uri(filename, mime):
    path = os.path.join(deploy_dir, filename)
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode('ascii')
    return f'data:{mime};base64,{data}'

print('Reading HTML...')
with open(os.path.join(deploy_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

files = [
    ('Echoes产品介绍.mp4', 'video/mp4'),
    ('img_soul.jpg',       'image/jpeg'),
    ('img_wangyiyun.jpg',  'image/jpeg'),
]

for filename, mime in files:
    path = os.path.join(deploy_dir, filename)
    if not os.path.exists(path):
        print(f'  SKIP (not found): {filename}')
        continue
    print(f'  Encoding {filename} ...')
    data_uri = file_to_data_uri(filename, mime)
    html = html.replace(f'src="{filename}"', f'src="{data_uri}"')
    html = html.replace(f"src='{filename}'", f"src='{data_uri}'")
    html = html.replace(f'href="{filename}"', f'href="{data_uri}"')
    print(f'  Done: {filename}')

out = os.path.join(deploy_dir, 'index_standalone.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)

size_mb = os.path.getsize(out) / 1024 / 1024
print(f'\nDone! -> {out}  ({size_mb:.1f} MB)')
