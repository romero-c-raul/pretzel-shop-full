const pool = require('../config/database');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Running database migrations...');

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        image_large VARCHAR(500),
        image_thumb VARCHAR(500),
        description TEXT,
        full_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create customers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        zip VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_cost DECIMAL(10, 2) DEFAULT 5.00,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert initial products
    const products = [
      {
        name: 'Classic Salted Twist',
        price: 3.00,
        image: 'https://placehold.co/600x400/fef3c7/451a03?text=Classic+Salted',
        image_large: 'https://placehold.co/800x800/fef3c7/451a03?text=Classic+Salted',
        image_thumb: 'https://placehold.co/100x100/fef3c7/451a03?text=Salted',
        description: 'The timeless original. Perfectly salted, golden brown, and delightfully chewy.',
        full_description: 'The timeless classic. Perfectly baked to a golden brown, lightly buttered, and generously sprinkled with coarse sea salt. An unbeatable savory snack that\'s both chewy and soft.\n\nIngredients: Enriched flour, water, yeast, salt, butter.'
      },
      {
        name: 'Cinnamon Sugar Dusted',
        price: 3.50,
        image: 'https://placehold.co/600x400/fef3c7/451a03?text=Cinnamon+Sugar',
        image_large: 'https://placehold.co/800x800/fef3c7/451a03?text=Cinnamon+Sugar',
        image_thumb: 'https://placehold.co/100x100/fef3c7/451a03?text=Cinnamon',
        description: 'A sweet treat, generously coated in aromatic cinnamon and sparkling sugar.',
        full_description: 'Indulge in our sweet cinnamon sugar pretzel. A perfect balance of warm cinnamon and sweet sugar coating every bite. Perfect for dessert lovers and those with a sweet tooth.\n\nIngredients: Enriched flour, water, yeast, butter, cinnamon, sugar.'
      },
      {
        name: 'Jalapeño Cheddar',
        price: 4.00,
        image: 'https://placehold.co/600x400/fef3c7/451a03?text=Jalapeño+Cheddar',
        image_large: 'https://placehold.co/800x800/fef3c7/451a03?text=Jalapeño+Cheddar',
        image_thumb: 'https://placehold.co/100x100/fef3c7/451a03?text=Jalapeño',
        description: 'A savory kick! Topped with real jalapeño slices and sharp cheddar cheese.',
        full_description: 'For those who love a little heat! Our jalapeño cheddar pretzel combines fresh jalapeño slices with sharp cheddar cheese for a bold, savory flavor that packs a punch.\n\nIngredients: Enriched flour, water, yeast, butter, jalapeños, cheddar cheese.'
      },
      {
        name: 'Everything Bagel Spice',
        price: 4.00,
        image: 'https://placehold.co/600x400/fef3c7/451a03?text=Everything+Spice',
        image_large: 'https://placehold.co/800x800/fef3c7/451a03?text=Everything+Spice',
        image_thumb: 'https://placehold.co/100x100/fef3c7/451a03?text=Everything',
        description: 'Why choose one flavor? Coated in poppy seeds, sesame, garlic, onion, and salt.',
        full_description: 'The best of all flavors in one! Our everything bagel spice pretzel features a perfect blend of poppy seeds, sesame seeds, garlic, onion, and salt. Every bite is a flavor explosion.\n\nIngredients: Enriched flour, water, yeast, butter, poppy seeds, sesame seeds, garlic, onion, salt.'
      }
    ];

    // Check if products already exist
    const existingProducts = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(existingProducts.rows[0].count) === 0) {
      console.log('Inserting initial products...');
      for (const product of products) {
        await pool.query(
          `INSERT INTO products (name, price, image, image_large, image_thumb, description, full_description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            product.name,
            product.price,
            product.image,
            product.image_large,
            product.image_thumb,
            product.description,
            product.full_description
          ]
        );
      }
      console.log('Products inserted successfully');
    } else {
      console.log('Products already exist, skipping insertion');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

