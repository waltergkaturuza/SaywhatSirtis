const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read the source directory
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Source paths
  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const publicSrc = path.join(process.cwd(), 'public');
  
  // Destination paths - simplified for cross-platform compatibility
  const staticDest = path.join(process.cwd(), '.next', 'standalone', '.next', 'static');
  const publicDest = path.join(process.cwd(), '.next', 'standalone', 'public');

  console.log('Copying static files for standalone deployment...');

  // Copy .next/static to standalone
  if (fs.existsSync(staticSrc)) {
    console.log('Copying .next/static files...');
    copyDir(staticSrc, staticDest);
    console.log('✓ Static files copied successfully');
  } else {
    console.log('⚠ .next/static directory not found');
  }

  // Copy public to standalone
  if (fs.existsSync(publicSrc)) {
    console.log('Copying public files...');
    copyDir(publicSrc, publicDest);
    console.log('✓ Public files copied successfully');
  } else {
    console.log('⚠ public directory not found');
  }

  console.log('✅ Static file copy completed successfully');
} catch (error) {
  console.error('❌ Error copying static files:', error);
  process.exit(1);
}