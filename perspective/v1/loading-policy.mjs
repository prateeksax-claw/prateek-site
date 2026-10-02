// Screen size and input type do not block muted playback after critical content.
export function allowAutoplay({contentReady,inView,hidden,reduced,saveData,effectiveType}) {
 return Boolean(contentReady&&inView&&!hidden&&!reduced&&!saveData&&!['slow-2g','2g','3g'].includes(effectiveType));
}
