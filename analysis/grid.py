import sys, json, numpy as np, librosa
from scipy.signal import butter, sosfilt
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True, duration=70)
yp = librosa.effects.hpss(y)[1]
hop=128
def band(lo,hi):
  sos=butter(4,[lo,hi],btype="band",fs=sr,output="sos")
  return librosa.onset.onset_strength(y=sosfilt(sos,yp),sr=sr,hop_length=hop)
k=band(40,160); s=band(1000,3000); full=librosa.onset.onset_strength(y=yp,sr=sr,hop_length=hop)
tt=librosa.times_like(full,sr=sr,hop_length=hop)
def score(T,t0,env):
  bt=t0+np.arange(int((65-t0)/T))*T; bt=bt[bt>0]
  return env[np.searchsorted(tt,bt).clip(0,len(tt)-1)].mean()
best=max(((score(T,t0,full),T,t0) for T in np.arange(0.486,0.498,0.0001) for t0 in np.arange(0,T,0.002)))
_,T,t0=best
# refine per-beat: nearest onset peak within ±40ms
on=librosa.onset.onset_detect(onset_envelope=full,sr=sr,hop_length=hop,units='time')
bt=t0+np.arange(int((65-t0)/T))*T
err=np.array([on[np.argmin(np.abs(on-b))]-b for b in bt])
m=np.abs(err)<0.035
rms=librosa.feature.rms(y=y,hop_length=512)[0]; rt=librosa.times_like(rms,sr=sr,hop_length=512)
bars=[(n, round(float(rms[(rt>=t0+n*T)&(rt<t0+(n+4)*T)].mean()),3)) for n in range(0,len(bt)-4,4)]
kick=[(n, round(float(k[np.searchsorted(tt,b)]),2)) for n,b in enumerate(bt)]
top=sorted(kick,key=lambda x:-x[1])[:12]
print(json.dumps(dict(bpm=60/T,t0=t0,T=T,match=float(m.mean()),mean_abs_ms=float(np.abs(err[m]).mean()*1000),drift_ms=float(np.polyfit(bt[m],err[m],1)[0]*65*1000),bars=bars,topkick=sorted(top)),indent=None))
json.dump(dict(bpm=60/T,t0=t0,T=T,beats=bt.tolist(),hits=[dict(t=float(bt[n]),s=v,k='kick') for n,v in top]),open('analysis/beat_data.json','w'))
