const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
// const pool = new Pool({
//   host: 'localhost',
//   port: 5432,
//   database: 'your_database',
//   user: 'your_user',
//   password: 'your_password' // Make sure this is a string in quotes
// });

// const IMAGES_FOLDER = './product_images'; // Update this path

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: 'Fashion',
 password: 'Bhanuraj@2082',
  database: process.env.PGDATABASE,
});
const IMAGES_FOLDER = './images-folder'

// Simple mimetype detection
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function getIdentifierFromFilename(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

// Convert filename to URL slug format
function filenameToSlug(filename) {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function upload() {
  try {
    // Get all image files from the folder
    const files = fs.readdirSync(IMAGES_FOLDER).filter(f =>
      ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(path.extname(f).toLowerCase())
    );

    console.log(`Found ${files.length} images to upload`);

    for (const file of files) {
      const identifier = getIdentifierFromFilename(file);
      const urlSlug = filenameToSlug(file);
      const filePath = path.join(IMAGES_FOLDER, file);
      const buffer = fs.readFileSync(filePath);
      const mimetype = getMimeType(file);
      
      let productId = null;

      if (/^\d+$/.test(identifier)) {
        const r = await pool.query('SELECT id FROM product WHERE id = $1', [parseInt(identifier, 10)]);
        if (r.rowCount > 0) productId = r.rows[0].id;
      }
      if (!productId) {
        const r = await pool.query('SELECT id FROM product WHERE producturl = $1', [urlSlug]);
        if (r.rowCount > 0) productId = r.rows[0].id;
      }

      if (!productId) {
        const r = await pool.query('SELECT id FROM product WHERE producturl = $1', [identifier]);
        if (r.rowCount > 0) productId = r.rows[0].id;
      }
      if (!productId) {
        const r = await pool.query('SELECT id FROM product WHERE LOWER(product_name) = LOWER($1)', [identifier]);
        if (r.rowCount > 0) productId = r.rows[0].id;
      }

      if (!productId) {
        console.warn(`No product match for ${file} (tried: id, url="${urlSlug}", name="${identifier}"). Skipping.`);
        continue;
      }
      await pool.query(
        `UPDATE product 
         SET image = $1, image_mime = $2 
         WHERE id = $3`,
        [buffer, mimetype, productId]
      );
      
      console.log(`✓ Updated image for product_id=${productId} (${file})`);
    }

    console.log('\n✓ Upload complete!');
  } catch (err) {
    console.error('Error during upload:', err);
  } finally {
    await pool.end();
  }
}

// Run the upload
upload();