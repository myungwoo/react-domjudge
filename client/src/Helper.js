const pad2 = v => v < 10 ? '0'+v : ''+v;

const formatTime = (b, t) => {
  let s = Math.max(Math.floor((t-b)/60), 0);
  return pad2(Math.floor(s/60)) + ':' + pad2(s%60);
};

export {pad2, formatTime};
