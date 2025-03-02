 const extractImageIdsFromContent = (content) => {
  const imageIds = [];
  // Updated regex to handle single quotes and '&sz=' in the URL
  const regex = /<img[^>]*src=['"][^'"]*id=([^&'"]+)/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    imageIds.push(match[1]); // Capture group 1 contains the image ID
  }

  return imageIds;
};

module.exports = { extractImageIdsFromContent };