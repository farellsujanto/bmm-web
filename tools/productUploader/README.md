# Product Uploader Tool

This tool allows you to bulk upload products to the system using a CSV file and local image files.

## Setup

1. Install dependencies:
```bash
cd tools/productUploader
npm install
```

2. Configure your environment:
   - Copy `.env.example` to `.env`
   - Set your API URL and authentication token

3. Prepare your data:
   - Create a CSV file with product data (see `example.csv`)
   - Create an `images` folder with subfolders for each product
   - Name image files in the format: `x1.png`, `x2.png`, etc.

## CSV Format

The CSV file should have the following columns:

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| name | Yes | string | Product name (slug & SKU auto-generated) |
| description | No | string | Full product description |
| shortDescription | No | string | Brief description |
| dataSheetUrl | No | string | URL to product datasheet |
| price | No | number | Price in smallest currency unit |
| discount | No | number | Discount percentage (0-100) |
| stock | No | number | Stock quantity |
| isActive | No | boolean | true/false |
| affiliatePercent | No | number | Affiliate commission percentage |
| isPreOrder | No | boolean | true/false |
| preOrderReadyEarliest | No | number | Days until earliest ready date |
| preOrderReadyLatest | No | number | Days until latest ready date |
| brandId | Yes | number | Brand ID from database |
| categoryId | Yes | number | Category ID from database |
| imageFolder | Yes | string | Folder name in images/ directory |

## Image Folder Structure

```
tools/productUploader/
├── images/
│   ├── iPhone15Pro/
│   │   ├── x1.png
│   │   ├── x2.png
│   │   └── x3.png
│   ├── MacBookAir/
│   │   ├── x1.png
│   │   └── x2.png
│   └── GalaxyS24/
│       ├── x1.png
│       ├── x2.png
│       ├── x3.png
│       └── x4.png
├── products.csv
└── productUploader.js
```

## Usage

```bash
# Upload products from CSV file
node productUploader.js products.csv

# Dry run (validate without uploading)
node productUploader.js products.csv --dry-run
```

## Environment Variables

Create a `.env` file with:

```env
API_URL=http://localhost:3000
AUTH_TOKEN=your_jwt_token_here
```

## Notes

- **Slug and SKU are auto-generated** from the product name (no need to specify in CSV)
- Images are uploaded in order (x1, x2, x3, etc.)
- Missing images will be skipped with a warning
- Failed uploads will be logged but won't stop the process
- The tool will create products one at a time to avoid rate limiting
