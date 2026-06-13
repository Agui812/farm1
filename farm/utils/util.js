const API_BASE = 'http://localhost:3000';

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const fixImageUrl = url => {
  if (!url) return url;
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    return API_BASE + url;
  }
  return url;
}

const fixImageUrls = list => {
  if (!Array.isArray(list)) return list;
  return list.map(item => {
    if (item && typeof item === 'object') {
      const newItem = { ...item };
      if (newItem.image) newItem.image = fixImageUrl(newItem.image);
      if (newItem.product_image) newItem.product_image = fixImageUrl(newItem.product_image);
      if (newItem.avatar) newItem.avatar = fixImageUrl(newItem.avatar);
      return newItem;
    }
    return item;
  });
}

module.exports = {
  formatTime,
  fixImageUrl,
  fixImageUrls
}
