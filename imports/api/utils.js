export function fullName(user) {
  if (!user) {
    return undefined;
  }
  const parts = [];
  if (user.firstName) {
    parts.push(user.firstName);
  }
  if (user.middleName) {
    parts.push(user.middleName);
  }
  if (user.lastName) {
    parts.push(user.lastName);
  }
  return parts.join(' ').trim();
}

export function escapeKeys(obj) {
  const newObj = {};
  _.each(obj, (value, key) => {
    const key2 = key.replace(/\./g, '::');
    newObj[key2] = value;
  });
  return newObj;
}

export function unescapeKeys(obj) {
  const newObj = {};
  _.each(obj, (value, key) => {
    const key2 = key.replace(/::/g, '.');
    newObj[key2] = value;
  });
  return newObj;
}

export function trimText(str = '', maxLen = 50) {
  if (str.length > maxLen) {
    return `${str.substring(0, maxLen - 3)}...`;
  }
  return str;
}
