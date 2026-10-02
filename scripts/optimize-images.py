from pathlib import Path
from PIL import Image,ImageOps
import re,json
root=Path(__file__).resolve().parents[1]
sources=set(json.loads((root/'data/image-variants.json').read_text(encoding='utf-8')))
sources={x.lstrip('/') for x in sources}
sources.add('portrait.jpg')
for p in [root/'src/home.html',root/'journal.html',*root.glob('journal/*.html')]:
 for img in re.findall(r'<img\b[^>]*>',p.read_text(encoding='utf-8')):
  src=re.search(r'\bsrc="/?(journal-media/[^"?]+)"',img)
  if src and not re.search(r'\.w\d+\.webp$',src[1]) and Path(src[1]).suffix.lower() in ['.jpg','.jpeg','.webp']: sources.add(src[1])
manifest={};saved=0
for src in sorted(sources):
 image=ImageOps.exif_transpose(Image.open(root/src)).convert('RGB');w,h=image.size
 widths=sorted(set([v for v in [180,360,700 if src=='portrait.jpg' else 960] if v<w]+[w]))
 variants=[]
 for width in widths:
  name=('portrait-'+str(width)+'.webp') if src=='portrait.jpg' else Path(src).with_suffix('').as_posix()+'.w'+str(width)+'.webp'
  im=image.resize((width,round(h*width/w)),Image.Resampling.LANCZOS)
  im.save(root/name,'WEBP',quality=82,method=6)
  variants.append({'src':'/'+name,'width':width,'bytes':(root/name).stat().st_size})
 manifest['/'+src]={'originalWidth':w,'originalHeight':h,'variants':variants}
 saved+=1
(root/'data/image-variants.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'originalsPreserved':saved,'responsiveFiles':sum(len(v['variants']) for v in manifest.values()),'portrait':manifest['/portrait.jpg']},indent=2))
