const sharp = require('sharp');
const path = require('path');

// Path to a single image
const inputPath = path.join(__dirname, 'public', 'images', 'DSC_0235.jpg');
const outputPath = path.join(__dirname, 'public', 'images', 'DSC_0235-optimized.jpg');

// Optimize the image
sharp(inputPath)
  .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 70 })
  .toFile(outputPath)
  .then(info => {
    console.log('Image optimized successfully!');
    console.log(info);
  })
  .catch(err => {
    console.error('Error optimizing image:', err);
  });
