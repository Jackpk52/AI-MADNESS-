let conversations = {};

function addToMemory(key, role, text) {
  if (!conversations[key]) conversations[key] = [];
  conversations[key].push({ role, text });

  // Keep last 10 lines only
  if (conversations[key].length > 10) {
    conversations[key] = conversations[key].slice(-10);
  }
}

function getMemory(key) {
  return conversations[key] || [];
}

function clearMemory(key) {
  delete conversations[key];
}

export { addToMemory, getMemory, clearMemory };