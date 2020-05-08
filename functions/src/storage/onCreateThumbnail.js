const functions = require('firebase-functions');
const admin = require('../admin');

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const storage = admin.storage().bucket();

module.exports = functions.storage.object().onFinalize(async (object) => {
  // const userUid = filePath.split('/').shift();

  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.

  // ? Not an image, skip creating thumbnail
  if (!contentType.startsWith('image/')) {
    return false;
  }

  const fileName = path.basename(filePath);

  // ? Already a thumbnail, skip
  if (fileName.startsWith('thumb_')) {
    return false;
  }

  const tempFilePath = path.join(os.tmpdir(), fileName);

  // ? Download file to temp directory
  await storage.file(filePath).download({ destination: tempFilePath });

  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(os.tmpdir(), thumbFileName);

  await sharp(tempFilePath).resize(100, 100).toFile(thumbFilePath);

  await storage.upload(thumbFilePath, {
    destination: path.join(path.dirname(filePath), thumbFileName),
    metadata: {
      contentType,
    },
  });

  return fs.unlink(tempFilePath);
});
