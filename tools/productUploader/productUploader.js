import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const API_KEY = process.env.API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSlug(name) {
    throw 'BROKEN';
  return name
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function generateSKU(name) {
  return name
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function parseCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    return records;
  } catch (error) {
    log(`Error reading CSV file: ${error.message}`, 'red');
    process.exit(1);
  }
}

function getImagesForProduct(imageFolder) {
  if (!imageFolder || imageFolder.trim() === '') {
    log(`  ⚠️  Warning: No image folder specified`, 'yellow');
    return [];
  }

  // Replace / with : for macOS compatibility
  const folderName = imageFolder.trim().replace(/\//g, ':');
  const imagesPath = path.join(__dirname, 'images', folderName);
  
  if (!fs.existsSync(imagesPath)) {
    log(`  ⚠️  Warning: Images folder not found: ${imagesPath}`, 'yellow');
    log(`  💡  Make sure to create: tools/productUploader/images/${folderName}/`, 'yellow');
    return [];
  }

  const files = fs.readdirSync(imagesPath);
  
  log(`  📁 Found ${files.length} file(s) in folder: ${files.join(', ')}`, 'blue');
  
  // Sort files by number (x1.png, x2.png, etc.)
  // Accept formats: x1.png, 1.png, image1.png, etc.
  const imageFiles = files
    .filter(file => {
      const isImage = /\.(png|jpg|jpeg|webp)$/i.test(file);
      if (!isImage) {
        log(`  ⚠️  Skipping non-image file: ${file}`, 'yellow');
      }
      return isImage;
    })
    .sort((a, b) => {
      // Extract first number from filename
      const numA = parseInt((a.match(/\d+/) || ['0'])[0]);
      const numB = parseInt((b.match(/\d+/) || ['0'])[0]);
      return numA - numB;
    })
    .map(file => path.join(imagesPath, file));

  return imageFiles;
}

async function uploadProduct(productData, dryRun = false) {
  const { imageFolder, ...fields } = productData;

  // Auto-generate slug and SKU from name
  const slug = generateSlug(fields.name);
  const sku = fields.name;

  log(`\n📦 Processing: ${fields.name}`, 'cyan');
  log(`  Slug: ${slug} (auto-generated)`);
  log(`  SKU: ${sku} (auto-generated)`);
  log(`  Image Folder: ${imageFolder || '(not specified)'}`);
  log(`  Brand ID: ${fields.brandId}`);
  log(`  Category ID: ${fields.categoryId}`);
  
  // Get images for this product
  const imageFiles = getImagesForProduct(imageFolder);
  log(`  Found ${imageFiles.length} image(s)`, imageFiles.length > 0 ? 'green' : 'yellow');

  if (dryRun) {
    log('  [DRY RUN] Would upload this product', 'blue');
    return { success: true, dryRun: true };
  }

  // Create form data
  const formData = new FormData();

  // Add slug and SKU
  formData.append('slug', slug);
  formData.append('sku', sku);
  formData.append('isActive', 'true');
  formData.append('isPreorder', 'true');

  // Add all text fields
  Object.keys(fields).forEach(key => {
    const value = fields[key];
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  // Add images
  imageFiles.forEach(imagePath => {
    const stream = fs.createReadStream(imagePath);
    const filename = path.basename(imagePath);
    formData.append('images', stream, filename);
    log(`  📷 Adding image: ${filename}`, 'blue');
  });

  // Make API request
  try {
    const response = await fetch(`${API_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'X-Api-Key': API_KEY,
        'Api-Key': API_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok && result.success) {
      log(`  ✅ Success: Product created (ID: ${result.data?.id})`, 'green');
      return { success: true, data: result.data };
    } else {
      log(`  ❌ Failed: ${result.message || 'Unknown error'}`, 'red');
      if (result.error) {
        log(`     Error: ${result.error}`, 'red');
      }
      return { success: false, error: result.message };
    }
  } catch (error) {
    log(`  ❌ Network error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Usage: node productUploader.js <csv-file> [--dry-run]', 'yellow');
    log('Example: node productUploader.js products.csv', 'yellow');
    process.exit(1);
  }

  const csvFile = args[0];
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(csvFile)) {
    log(`CSV file not found: ${csvFile}`, 'red');
    process.exit(1);
  }

  if (!AUTH_TOKEN && !dryRun) {
    log('Error: AUTH_TOKEN not set in .env file', 'red');
    log('Please create a .env file with your authentication token', 'yellow');
    process.exit(1);
  }

  log('='.repeat(60), 'cyan');
  log('🚀 Product Uploader Tool', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`CSV File: ${csvFile}`);
  log(`API URL: ${API_URL}`);
  log(`Mode: ${dryRun ? 'DRY RUN (no actual uploads)' : 'LIVE'}`, dryRun ? 'yellow' : 'green');
  log('='.repeat(60), 'cyan');

  const products = parseCSV(csvFile);
  log(`\nFound ${products.length} product(s) in CSV\n`, 'green');

  const results = {
    total: products.length,
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    log(`\n[${i + 1}/${products.length}]`, 'cyan');
    
    const result = await uploadProduct(product, dryRun);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        product: product.name,
        error: result.error
      });
    }

    // Small delay to avoid overwhelming the server
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Upload Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total products: ${results.total}`);
  log(`✅ Successful: ${results.success}`, results.success > 0 ? 'green' : 'reset');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');

  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red');
    results.errors.forEach(err => {
      log(`  - ${err.product}: ${err.error}`, 'red');
    });
  }

  log('='.repeat(60), 'cyan');
  
  if (dryRun) {
    log('\n💡 This was a dry run. Use without --dry-run to actually upload products.', 'yellow');
  }
}

main().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
