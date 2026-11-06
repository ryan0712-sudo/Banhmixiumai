import sys, numpy as np, librosa
from scipy.signal import correlate
a,sr=librosa.load(sys.argv[1],sr=22050,duration=12)   # rendered
b,_=librosa.load(sys.argv[2],sr=22050,duration=12)    # source bgm
c=correlate(a,b,mode='full',method='fft'); lag=np.argmax(c)-(len(b)-1)
print(f"render lag vs source: {lag/sr*1000:.1f} ms = {lag/sr*30:.2f} f")
