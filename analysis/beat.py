import sys, json, numpy as np, librosa
from scipy.signal import butter, sosfilt
path=sys.argv[1]
y, sr = librosa.load(path, sr=22050, mono=True, duration=60)
yp = librosa.effects.hpss(y)[1]
tempo, beats = librosa.beat.beat_track(y=yp, sr=sr, tightness=400, units="time")
i=np.arange(len(beats)); A=np.vstack([i,np.ones_like(i)]).T
(T,t0),*_=np.linalg.lstsq(A,beats,rcond=None)
res=beats-(t0+i*T)
def band(lo,hi):
  sos=butter(4,[lo,hi],btype="band",fs=sr,output="sos")
  e=librosa.onset.onset_strength(y=sosfilt(sos,yp),sr=sr); return e
k=band(40,160); times=librosa.times_like(k,sr=sr)
on=librosa.onset.onset_detect(y=yp,sr=sr,units='time')
# match ratio
match=np.mean([np.min(np.abs(on-b))<0.035 for b in t0+np.arange(int((50-t0)/T))*T])
rms=librosa.feature.rms(y=y)[0]; rt=librosa.times_like(rms,sr=sr)
sec=[float(np.mean(rms[(rt>=s)&(rt<s+T*4)])) for s in t0+np.arange(0,int(50/T),4)*T]
print(json.dumps(dict(file=path,bpm=60/T,t0=t0,T=T,resid_ms=float(np.abs(res).max()*1000),match=float(match),rms_per_bar=[round(x,3) for x in sec])))
