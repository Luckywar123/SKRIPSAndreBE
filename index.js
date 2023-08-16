const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const { Sequelize } = require('sequelize');

// Middleware
app.use(bodyParser.json());
app.use(cors());

const sequelize = new Sequelize(
  process.env.DATABASE,  // Nama database
  process.env.USER,      // Username
  process.env.PASSWORD,  // Password
  {
    host: process.env.HOST,    // Host
    dialect: 'mysql',          // Dialect (bisa juga 'postgres', 'sqlite', dll.)
    logging: false,            // Nonaktifkan logging
  }
);

// Test koneksi
sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Connection failed:', error);
  });

// Import and initialize User model
const User = require('./models/User')(sequelize);

const Product = require('./models/Product')(sequelize);
const Sku = require('./models/Sku')(sequelize);
const History = require('./models/History')(sequelize); // Import the History model
const Kasir = require('./models/Kasir');
const ReturnItem = require('./models/ReturnItem');


// Set up associations
Product.hasMany(Sku, { foreignKey: 'idBarang', as: 'skus' });
Sku.belongsTo(Product, { foreignKey: 'idBarang', as: 'product' });
Kasir.belongsTo(Sku, { foreignKey: 'idSKU' });
History.belongsTo(Product, { foreignKey: 'idBarang', as: 'product' });
History.belongsTo(Sku, { foreignKey: 'idSKU', as: 'sku' });
History.belongsTo(Kasir, { foreignKey: 'idTransaksi', as: 'kasir' });



// Route for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Received data from frontend:", req.body);

  try {
    const user = await User.findOne({
      where: {
        username: username,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (user.password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});


// Fetch products from the database
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});


app.get("/products/:idBarang/skus", async (req, res) => {
  const idBarang = req.params.idBarang;

  try {
    const product = await Product.findOne({
      where: { idBarang },
      include: [{ model: Sku, as: 'skus' }] // Include the 'skus' association
    });

    if (product) {
      res.json({
        data: {
          nama: product.nama,
          skus: product.skus, // Use 'skus' from the association alias
        },
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching skus:", error);
    res.status(500).json({ error: "Error fetching skus" });
  }
});

// Route to fetch return items with product and SKU details
app.get("/return-items", async (req, res) => {
  try {
    const returnItems = await ReturnItem.findAll({
      include: [
        {
          model: Product, // Import and define the Product model
          attributes: ['nama'],
        },
        {
          model: Sku, // Import and define the Sku model
          attributes: ['skuCode'],
        },
      ],
    });

    res.json({ data: returnItems });
  } catch (error) {
    console.error("Error fetching return items:", error);
    res.status(500).json({ error: "Error fetching return items" });
  }
});

app.post('/insert-history', async (req, res) => {
  const { items } = req.body;
  console.log(req.body);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid data provided' });
  }

  // Get current date
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    // Start a new Sequelize transaction
    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        const { idBarang, jumlah, idSKU, idTransaksi, jenisTransaksi } = item;

        // Insert data into history table
        await History.create({
          tanggal: currentDate,
          jumlah,
          idTransaksi,
          idBarang,
          idSKU,
          jenis_transaksi: jenisTransaksi,
        }, { transaction });

        // Update SKU quantity
        await Sku.decrement('stok', {
          by: jumlah,
          where: { idSKU },
          transaction,
        });
      }
    });

    res.status(200).json({ message: 'Transaction added to history successfully' });
  } catch (error) {
    console.error('Error inserting data into history table:', error);
    res.status(500).json({ error: 'Error inserting data into history table' });
  }
});
// Fetch history data
app.get('/history', async (req, res) => {
  console.log(req.body);
  try {
    const historyData = await History.findAll({
      attributes: [
        'idHistory',
        [sequelize.fn('DATE_FORMAT', sequelize.col('tanggal'), '%Y-%m-%d'), 'Tanggal'],
        [sequelize.col('product.nama'), 'Nama Barang'],
        'jumlah',
        [sequelize.col('sku.skuCode'), 'SKU'],
        'jenis_transaksi',
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: [],
        },
        {
          model: Sku,
          as: 'sku',
          attributes: [],
        },
      ],
    });

    res.json({ data: historyData });
  } catch (error) {
    console.error('Error fetching history data:', error);
    res.status(500).json({ error: 'Error fetching history data' });
  }
});




// Route to insert data into the kasir table
// app.post("/kasir", async (req, res) => {
//   const { idTransaksi, jumlah, idSKU } = req.body;
//   console.log("Received data :", req.body);

//   try {
//     const sku = await Sku.findByPk(idSKU, {
//       include: {
//         model: Product,
//         attributes: ['idBarang', 'nama', 'harga'],
//       },
//     });

//     if (!sku) {
//       res.status(404).json({ message: 'Invalid SKU' });
//       return;
//     }

//     await Kasir.create({
//       idTransaksi,
//       jumlah,
//       idSKU,
//     });

//     res.json({
//       message: "Data added to kasir successfully",
//       data: {
//         idTransaksi,
//         jumlah,
//         sku: {
//           idSKU: sku.idSKU,
//           skuCode: sku.skuCode,
//           product: {
//             idBarang: sku.product.idBarang,
//             nama: sku.product.nama,
//             harga: sku.product.harga,
//           },
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error adding to kasir:", error);
//     res.status(500).json({ error: "Error adding to kasir" });
//   }
// });

// Fetch kasir data
app.get("/kasir", async (req, res) => {
  try {
    const kasir = await Kasir.findAll({
      include: [
        {
          model: Sku,
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['nama', 'harga','idBarang'],
            }
          ],
          attributes: ['skuCode'],
        },
      ],
    });

    // Log the retrieved data before sending the response
    console.log("Retrieved Kasir Data:", kasir);

    res.json({ data: kasir });
  } catch (error) {
    console.error('Error fetching kasir:', error);
    res.status(500).json({ error: 'Error fetching kasir' });
  }
});








app.post('/products', async (req, res) => {
  const newProduct = req.body;
  try {
    const createdProduct = await Product.create(newProduct);
    res.json({
      message: 'Product added successfully',
      data: createdProduct,
    });
  } catch (error) {
    console.error('Error adding new product:', error);
    res.status(500).json({ error: 'Error adding new product' });
  }
});

app.post('/products/:idBarang/skus', async (req, res) => {
  const idBarang = req.params.idBarang;
  const { skuCode, productionDate, expiredDate, inboundDate, stok } = req.body;

  try {
    // Create the new SKU record
    const createdSku = await Sku.create({
      idBarang,
      skuCode,
      productionDate,
      expiredDate,
      inboundDate,
      stok,
    });

    // Insert SKU data into the history table as an addition transaction
    const currentDate = new Date().toISOString().split('T')[0];
    await History.create({
      tanggal: currentDate,
      jumlah: stok,
      idBarang: idBarang,
      idSKU: createdSku.idSKU,
      jenis_transaksi: 'Barang Masuk',
    });

    res.json({
      message: 'SKU added successfully',
      data: createdSku,
    });
  } catch (error) {
    console.error('Error adding new SKU:', error);
    res.status(500).json({ error: 'Error adding new SKU' });
  }
});


app.post("/return-items", async (req, res) => {
  const { idBarang, idSKU, jumlah, alasan } = req.body;

  try {
    // Periksa apakah SKU yang diberikan valid
    const sku = await Sku.findOne({
      where: { idSKU: idSKU },
    });

    if (!sku) {
      // Jika idSKU tidak valid, kembalikan pesan kesalahan
      return res.status(404).json({ message: "Invalid SKU" });
    }

    // Tambahkan data pengembalian ke dalam tabel ReturnItem
    const returnItem = await ReturnItem.create({
      idBarang: idBarang,
      idSKU: idSKU,
      jumlah: jumlah,
      alasan: alasan,
    });

    // Update the SKU quantity
    sku.stok -= jumlah;
    await sku.save();

    // Determine the transaction type and set jenis_transaksi to "Return"
    const jenisTransaksi = "Return";

    // Insert return item data into the history table with current date
    const currentDate = new Date().toISOString().slice(0, 10);
    await History.create({
      idBarang: idBarang,
      idSKU: idSKU,
      jumlah: jumlah,
      idReturn: returnItem.id,
      jenis_transaksi: jenisTransaksi,
      tanggal: currentDate,
    });

    res.json({
      message: "Return item added successfully",
      data: returnItem,
    });
  } catch (error) {
    console.error("Error adding return item:", error);
    res.status(500).json({ error: "Error adding return item" });
  }
});


app.post("/kasir", async (req, res) => {
  const { idTransaksi, jumlah, idSKU } = req.body;
  console.log("Received data:", req.body);

  try {
    // Check if idSKU is valid
    const sku = await Sku.findOne({
      where: { idSKU: idSKU }
    });

    if (!sku) {
      // If idSKU is not valid, return an error
      res.status(404).json({ message: "Invalid SKU" });
      return;
    }

    // Proceed to insert data into kasir table using Sequelize
    const createdKasirTransaction = await Kasir.create({
      idTransaksi: idTransaksi,
      jumlah: jumlah,
      idSKU: idSKU
    });

    res.json({
      message: "Data added to kasir successfully",
      data: {
        idTransaksi: createdKasirTransaction.idTransaksi,
        jumlah: createdKasirTransaction.jumlah,
        idSKU: createdKasirTransaction.idSKU
      }
    });
  } catch (error) {
    console.error("Error adding to kasir:", error);
    res.status(500).json({ error: "Error adding to kasir" });
  }
});

app.get('/products/oldest/:idBarang', async (req, res) => {
  const idBarang = req.params.idBarang;

  try {
    const result = await Sku.findOne({
      attributes: ['idSKU', 'inboundDate'],
      where: { idBarang: idBarang },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['nama'],
        },
      ],
      order: [['inboundDate', 'ASC']],
      limit: 1,
    });

    if (result) {
      res.json(result);
    } else {
      res.json({ idSKU: null });
    }
  } catch (error) {
    console.error('Error fetching oldest product:', error);
    res.status(500).json({ error: 'Error fetching oldest product' });
  }
});

app.get('/products/idSKU/:namaProduk', async (req, res) => {
  const namaProduk = req.params.namaProduk;

  try {
    const results = await Product.findAll({
      attributes: ['idBarang', 'nama'],
      include: [
        {
          model: Sku,
          as: 'skus', // Specify the alias for the association
          attributes: ['skuCode'],
        },
      ],
      where: { nama: namaProduk },
    });

    res.json({ data: results });
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({ error: 'Error fetching product by name' });
  }
});




// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
