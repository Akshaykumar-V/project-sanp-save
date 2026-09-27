function normalizeEntityName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, '_');
}

function getEntityDisplayName(name) {
  if (!name || typeof name !== 'string') {
    return 'Unknown Entity';
  }

  return name
    .trim()
    .replace(/\s+/g, ' ');
}

module.exports = {
  normalizeEntityName,
  getEntityDisplayName,
};