// No animation request for phones, tablets, reduced motion or known slow links.
export function allowAutoplay({contentReady,inView,hidden,width,finePointer,reduced,saveData,effectiveType}) {
 return Boolean(contentReady&&inView&&!hidden&&width>900&&finePointer&&!reduced&&!saveData&&!['slow-2g','2g','3g'].includes(effectiveType));
}
