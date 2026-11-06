# Deterministic procedural SFX (Freesound refused automated access from this sandbox: HTTP 403).
import numpy as np, wave, sys, os
from scipy.signal import butter, sosfilt, lfilter
SR=48000; rng=np.random.default_rng(7); out=sys.argv[1]
def save(name,x,peak=0.7):
    x=x/np.max(np.abs(x))*peak
    with wave.open(os.path.join(out,name),'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        s=(np.clip(x,-1,1)*32767).astype(np.int16); w.writeframes(np.column_stack([s,s]).tobytes())
def pink(n):
    b=[0.049922035,-0.095993537,0.050612699,-0.004408786]; a=[1,-2.494956002,2.017265875,-0.522189400]
    return lfilter(b,a,rng.standard_normal(n))
def sweep_bp(x,f0,f1,q=1.2):
    # time-varying band-pass via short overlapping blocks
    n=len(x); blk=512; y=np.zeros(n); win=np.hanning(blk*2)
    for i in range(0,n-blk,blk):
        t=i/n; fc=f0*(f1/f0)**t
        lo=max(30,fc/(1+1/q)); hi=min(SR/2-100,fc*(1+1/q))
        sos=butter(2,[lo,hi],btype='band',fs=SR,output='sos')
        seg=x[max(0,i-blk//2):i+blk*2-blk//2]
        ys=sosfilt(sos,seg)
        L=min(len(ys),len(win)); y[max(0,i-blk//2):max(0,i-blk//2)+L]+=ys[:L]*win[:L]
    return y
def env(n,att,rel,shape=2.0):
    t=np.arange(n)/SR; a=np.clip(t/att,0,1)**shape; r=np.clip((t[-1]-t)/rel,0,1)**1.5; return a*r
# whoosh: 0.8s, peak at ~0.55s (rising band then falling)
n=int(0.8*SR); x=pink(n); y=sweep_bp(x,300,3200,1.0)
t=np.arange(n)/SR; e=np.exp(-((t-0.55)/0.16)**2); save('whoosh.wav',y*e,0.6)
# soft whoosh (longer, lower) for card rise / eat-screen
n=int(1.0*SR); y=sweep_bp(pink(n),200,1800,0.9); t=np.arange(n)/SR; save('whoosh-soft.wav',y*np.exp(-((t-0.45)/0.22)**2),0.85)
# shutter: two short mechanical clicks (curtain open/close) with body resonance, A/B variants
def shutter(seed,gap):
    r=np.random.default_rng(seed); n=int(0.18*SR); y=np.zeros(n)
    for k,(off,amp) in enumerate([(0.0,1.0),(gap,0.7)]):
        i=int(off*SR); L=int(0.012*SR)
        burst=r.standard_normal(L)*np.exp(-np.arange(L)/(0.0025*SR))
        burst=sosfilt(butter(2,[1500,9000],btype='band',fs=SR,output='sos'),burst)
        res=np.sin(2*np.pi*(820+k*240)*np.arange(int(0.04*SR))/SR)*np.exp(-np.arange(int(0.04*SR))/(0.006*SR))*0.35
        y[i:i+L]+=burst*amp; y[i:i+len(res)]+=res*amp
    return y
save('shutter-a.wav',shutter(11,0.055),0.7); save('shutter-b.wav',shutter(23,0.048),0.7)
# riser: 1.1s noise rising to the landing point (ends at file end)
n=int(1.1*SR); y=sweep_bp(pink(n),400,6000,1.4); t=np.arange(n)/SR; e=(t/t[-1])**3; e[-int(0.01*SR):]*=np.linspace(1,0,int(0.01*SR)); save('riser.wav',y*e,0.85)
# impact: low thump (pitch-drop sine) + short noise crack + tail; peak at file start
n=int(1.6*SR); t=np.arange(n)/SR
f=48+70*np.exp(-t/0.05); ph=2*np.pi*np.cumsum(f)/SR; thump=np.sin(ph)*np.exp(-t/0.28)
crack=sosfilt(butter(2,[800,5000],btype='band',fs=SR,output='sos'),rng.standard_normal(n))*np.exp(-t/0.03)*0.5
tail=sosfilt(butter(2,[200,1500],btype='band',fs=SR,output='sos'),pink(n))*np.exp(-t/0.45)*0.18
save('impact.wav',thump+crack+tail,0.8)
# shimmer: soft high bell partials, slow decay (for the address tagline)
n=int(1.8*SR); t=np.arange(n)/SR; y=np.zeros(n)
for i,fr in enumerate([1568,2093,2637,3136,3951]):
    d=0.06*i; m=t>=d; y[m]+=np.sin(2*np.pi*fr*(t[m]-d))*np.exp(-(t[m]-d)/0.6)*np.clip((t[m]-d)/0.01,0,1)*(0.6**i*0.6+0.4)
save('shimmer.wav',y,0.8)
print('ok')
