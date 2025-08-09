const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'public', 'images');
const outputDir = path.join(__dirname, 'public', 'images-optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all image files
const imageFiles = fs.readdirSync(imagesDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext);
});

console.log(`Found ${imageFiles.length} images to optimize`);

// Process each image
async function optimizeImages() {
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      // Skip README.md or any non-image files
      if (path.extname(file).toLowerCase() === '.md') {
        console.log(`Skipping ${file}`);
        continue;
      }
      
      console.log(`Optimizing ${file}...`);
      
      // Optimize the image - reduce quality and resize if very large
      await sharp(inputPath)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toFile(outputPath);
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const savedPercentage = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(2);
      
      console.log(`${file}: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB → ${(outputStats.size / 1024 / 1024).toFixed(2)}MB (${savedPercentage}% saved)`);
    } catch (error) {
      console.error(`Error optimizing ${file}:`, error);
    }
  }
}

optimizeImages()
  .then(() => console.log('Image optimization complete!'))
  .catch(err => console.error('Error during optimization:', err));
