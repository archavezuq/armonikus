import math, random, json
from playwright.sync_api import sync_playwright
random.seed(7)
def dense(pts,step=1.0):
    out=[pts[0]]
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        d=math.hypot(x1-x0,y1-y0); n=max(1,int(d/step))
        for i in range(1,n+1): out.append((x0+(x1-x0)*i/n, y0+(y1-y0)*i/n))
    return out
JIT=1.0
def J(pts,j): return [{'x':x+random.uniform(-JIT*j,JIT*j),'y':y+random.uniform(-JIT*j,JIT*j)} for x,y in dense(pts)]
def ell(cx,cy,rx,ry,tilt,turns):
    n=28; out=[]
    for i in range(int(n*turns)+1):
        a=2*math.pi*i/n+random.uniform(-.1,.1); x=rx*math.cos(a); y=ry*math.sin(a)
        out.append((cx+x*math.cos(tilt)-y*math.sin(tilt), cy+x*math.sin(tilt)+y*math.cos(tilt)))
    return out
def fillh(cx,cy,rx,ry,passes,tilt):
    out=[]
    for i in range(passes):
        y=-ry+2*ry*i/(passes-1); xs=(-rx*.85,rx*.85) if i%2==0 else (rx*.85,-rx*.85)
        for x in xs: out.append((cx+x*math.cos(tilt)-y*math.sin(tilt), cy+x*math.sin(tilt)+y*math.cos(tilt)))
    return out
def line(x0,y0,x1,y1,n=14): return [(x0+(x1-x0)*i/n, y0+(y1-y0)*i/n) for i in range(n+1)]
def gen(kind):
    k=random.uniform(.85,1.5); rx=7*k; ry=5*k; cx,cy=100,100; tilt=random.uniform(-.5,.2)
    up=random.random()<.6; L=random.uniform(26,46); sl=random.uniform(-.2,.2)
    sx = cx+(rx if up else -rx); sy0=cy; sy1=cy-L if up else cy+L
    st=[]; exp=kind
    hollow = kind in ('w','h','hd')
    st.append(J(ell(cx,cy,rx,ry,tilt,random.uniform(.9,1.2)) if hollow else fillh(cx,cy,rx,ry,random.randint(4,9),tilt),.7))
    if kind!='w': st.append(J(line(sx,sy0,sx+L*math.sin(sl)*(1 if up else -1),sy1),.6))
    if kind in ('e','ed','s'):
        ex=sx; ey=sy1; d=random.choice([1,1.2,1.5])
        fl=[(ex+i*2*d, ey+(1 if up else -1)*(i**1.6)*0.65*d) for i in range(7)]
        st.append(J(fl,.5))
        if kind=='s':
            off=random.uniform(5,9)*(1 if up else -1)*-1*-1
            fl2=[(ex+i*2*d, ey+(1 if up else -1)*(off*(1 if up else -1)*(1 if up else -1)) *0 + (1 if up else -1)*((i**1.6)*0.65*d+abs(off))) for i in range(7)]
            st.append(J(fl2,.5))
    if kind in('hd','qd','ed'):
        st.append(J([(cx+rx+random.uniform(6,12), cy+random.uniform(-3,3))]*2,.1))
    return st,exp
import sys
JIT=float(sys.argv[1]) if len(sys.argv)>1 else 1.0
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto('file:///home/claude/armonikus/dist/Editor_Escritura_4_Voces.html')
    tot={}; ok={}; conf={}
    for kind in ['w','h','hd','q','qd','e','ed','s']:
        for _ in range(150):
            st,exp=gen(kind)
            r=pg.evaluate("s=>{const r=window.__lm3.recognizePen(s);return r.err?('ERR'):r.dur}",st)
            tot[kind]=tot.get(kind,0)+1; ok[kind]=ok.get(kind,0)+(r==kind)
            if r!=kind: conf[(kind,r)]=conf.get((kind,r),0)+1
    for k in tot: print(k, ok[k],'/',tot[k])
    print(conf)
