
// Route for user login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ error: "Error fetching user data" });
    } else {
      if (results.length === 0) {
        // If the user is not found, return an error response
        res.status(401).json({ message: "User not found" });
      } else {
        // Check if the provided password matches the hashed password in the database
        // (You should use a proper password hashing library like bcrypt for security)
        const user = results[0];
        if (user.password === password) {
          // If the password matches, return a success response
          res.json({ message: "Login successful" });
        } else {
          // If the password does not match, return an error response
          res.status(401).json({ message: "Incorrect password" });
        }
      }
    }
  });
});

// Fetch products from the database
app.get("/products", (req, res) => {
  const query = "SELECT * FROM products";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Error fetching products" });
    } else {
      res.json({ data: results });
    }
  });
});

// Fetch skus for a specific product
app.get("/products/:idBarang/skus", (req, res) => {
  const idBarang = req.params.idBarang;
  const queryProduct = `SELECT nama 
  FROM products
  WHERE idBarang = ?
  `;

  const querySkus = "SELECT * FROM skus WHERE idBarang = ?"
  connection.query([queryProduct, querySkus].join("; "), [idBarang, idBarang], (err, results) => {
    if (err) {
      console.error("Error fetching skus:", err);
      res.status(500).json({ error: "Error fetching skus" });
    } else {
      productResults = results[0][0];
      skusResults = results[1];

      res.json({ data: {
        nama: productResults.nama,
        skus: skusResults,
      } });
    }
  });
});

app.post("/products/:idBarang/skus", (req, res) => {
  const idBarang = req.params.idBarang;
  const { skuCode, productionDate, expiredDate, inboundDate, stok } = req.body;

  const insertQuery = `
    INSERT INTO skus (idBarang, skuCode, productionDate, expiredDate, inboundDate, stok)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  console.log("Received data from frontend:", req.body);

  connection.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting database transaction" });
    }

    connection.query(
      insertQuery,
      [idBarang, skuCode, productionDate, expiredDate, inboundDate, stok],
      (err, result) => {
        if (err) {
          console.error("Error adding new SKU:", err);
          connection.rollback(() => {
            res.status(500).json({ error: "Error adding new SKU" });
          });
        } else {
          const newSKU = {
            idSKU: result.insertId,
            skuCode,
            productionDate,
            expiredDate,
            inboundDate,
            stok,
          };

          // Insert the SKU data into the history table as an addition transaction
          const currentDate = new Date().toISOString().split('T')[0];
          const insertHistoryQuery = `
            INSERT INTO history (tanggal, jumlah, idBarang, idSKU, jenis_transaksi)
            VALUES (?, ?, ?, ?, ?)
          `;

          connection.query(
            insertHistoryQuery,
            [currentDate, stok, idBarang, newSKU.idSKU, 'Barang Masuk'],
            (err, historyResult) => {
              if (err) {
                console.error("Error adding to history:", err);
                connection.rollback(() => {
                  res.status(500).json({ error: "Error adding to history" });
                });
              } else {
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      console.error("Error committing transaction:", err);
                      res.status(500).json({ error: "Error committing transaction" });
                    });
                  } else {
                    res.json({
                      message: "New SKU added successfully",
                      data: newSKU,
                    });
                  }
                });
              }
            }
          );
        }
      }
    );
  });
});



// Route to fetch return items with product and SKU details
app.get("/return-items", (req, res) => {
  const query = `
    SELECT r.id, r.jumlah, r.alasan, p.nama AS nama_barang, s.skuCode
    FROM return_items r
    LEFT JOIN products p ON r.idBarang = p.idBarang
    LEFT JOIN skus s ON r.idSKU = s.idSKU
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching return items:", err);
      res.status(500).json({ error: "Error fetching return items" });
    } else {
      res.json({ data: results });
    }
  });
});

// Add a new product or update an existing product
app.post("/products", (req, res) => {
  const newProduct = req.body;
  if (!newProduct.idBarang) {
    // If idBarang is not provided, it's a new product, so INSERT into products table
    const insertQuery = "INSERT INTO products SET ?";
    connection.query(insertQuery, newProduct, (err, results) => {
      if (err) {
        console.error("Error adding new product:", err);
        res.status(500).json({ error: "Error adding new product" });
      } else {
        const insertedProduct = { ...newProduct, idBarang: results.insertId };
        res.json({
          message: "Product added successfully",
          data: insertedProduct,
        });
      }
    });
  } else {
    // If idBarang is provided, it's an existing product, so UPDATE the product in products table
    const idBarang = newProduct.idBarang;
    delete newProduct.idBarang; // Remove the idBarang from the newProduct object
    const updateQuery = "UPDATE products SET ? WHERE idBarang = ?";
    connection.query(updateQuery, [newProduct, idBarang], (err, results) => {
      if (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Error updating product" });
      } else {
        res.json({ message: "Product updated successfully", data: newProduct });
      }
    });
  }
});
app.post("/return-items", (req, res) => {
  const { idBarang, idSKU, jumlah, alasan } = req.body;

  // Periksa apakah SKU yang diberikan valid
  const checkSkuQuery = "SELECT * FROM skus WHERE idSKU = ?";
  connection.query(checkSkuQuery, [idSKU], (err, skuResults) => {
    if (err) {
      console.error("Error checking SKU:", err);
      res.status(500).json({ error: "Error checking SKU" });
      return;
    }

    if (skuResults.length === 0) {
      // Jika idSKU tidak valid, kembalikan pesan kesalahan
      res.status(404).json({ message: "Invalid SKU" });
    } else {
      // Tambahkan data pengembalian ke dalam tabel return_items
      const insertQuery =
        "INSERT INTO return_items (idBarang, idSKU, jumlah, alasan) VALUES (?, ?, ?, ?)";
      connection.query(
        insertQuery,
        [idBarang, idSKU, jumlah, alasan],
        (err, result) => {
          if (err) {
            console.error("Error adding return item:", err);
            res.status(500).json({ error: "Error adding return item" });
          } else {
            const insertedItem = {
              id: result.insertId,
              idBarang,
              idSKU,
              jumlah,
              alasan,
            };

            // Update the SKU quantity
            const updateSkuQuery = "UPDATE skus SET stok = stok - ? WHERE idSKU = ?";
            connection.query(updateSkuQuery, [jumlah, idSKU], (err) => {
              if (err) {
                console.error("Error updating SKU quantity:", err);
                res.status(500).json({ error: "Error updating SKU quantity" });
              } else {
                // Determine the transaction type and set jenis_transaksi to "Return"
                const jenisTransaksi = "Return";

                // Insert return item data into the history table with current date
                const currentDate = new Date().toISOString().slice(0, 10);
                const insertHistoryQuery = `
                  INSERT INTO history (idBarang, idSKU, jumlah, idReturn, jenis_transaksi, tanggal)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;
                connection.query(
                  insertHistoryQuery,
                  [idBarang, idSKU, jumlah, insertedItem.id, jenisTransaksi, currentDate],
                  (err) => {
                    if (err) {
                      console.error("Error adding to history:", err);
                      res.status(500).json({ error: "Error adding to history" });
                    } else {
                      res.json({
                        message: "Return item added successfully",
                        data: insertedItem,
                      });
                    }
                  }
                );
              }
            });
          }
        }
      );
    }
  });
});


app.get("/history", (req, res) => {
  const query = `
    SELECT
      h.idHistory AS 'ID History',
      DATE_FORMAT(h.tanggal, '%Y-%m-%d') AS 'Tanggal', -- Mengambil hanya bagian tanggal
      p.nama AS 'Nama Barang',
      h.jumlah AS 'Jumlah (Box)',
      s.skuCode AS 'SKU',
      h.jenis_transaksi AS 'Jenis Transaksi'
    FROM history h
    LEFT JOIN products p ON h.idBarang = p.idBarang
    LEFT JOIN skus s ON h.idSKU = s.idSKU
    LEFT JOIN kasir t ON h.idTransaksi = t.idTransaksi;
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching history:", err);
      res.status(500).json({ error: "Error fetching history" });
    } else {
      console.log("Fetched history data:", results);
      res.json({ data: results });
    }
  });
});



// Route to fetch data from the kasir table along with product details
app.get("/kasir", (req, res) => {
  const query = `
  SELECT
    k.idTransaksi AS 'No',
    p.idBarang AS 'idBarang',
    s.idSkU AS 'idSKU',
    s.skuCode AS 'Kode Barang',
    p.nama AS 'Nama Barang',
    p.harga AS 'Harga Satuan',
    k.jumlah AS 'Jumlah',
    p.harga * k.jumlah AS 'Harga'
  FROM kasir k
  JOIN skus s ON k.idSKU = s.idSKU
  JOIN products p ON s.idBarang = p.idBarang;

  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching kasir data:", err);
      res.status(500).json({ error: "Error fetching kasir data" });
    } else {
      res.json({ data: results });
    }
  });
});

// Route to insert data into the kasir table
app.post("/kasir", (req, res) => {
  const { idTransaksi, jumlah, idSKU } = req.body;
  console.log("Received data :", req.body);
  // Check if idSKU is valid
  const checkSkuQuery = "SELECT * FROM skus WHERE idSKU = ?";
  connection.query(checkSkuQuery, [idSKU], (err, skuResults) => {
    if (err) {
      console.error("Error checking SKU:", err);
      res.status(500).json({ error: "Error checking SKU" });
      return;
    }

    if (skuResults.length === 0) {
      // If idSKU is not valid, return an error
      res.status(404).json({ message: "Invalid SKU" });
    } else {
      // Proceed to insert data into kasir table
      const insertQuery = `
        INSERT INTO kasir (idTransaksi, jumlah, idSKU)
        VALUES (?, ?, ?)
      `;

      connection.query(
        insertQuery,
        [idTransaksi, jumlah, idSKU],
        (err, result) => {
          if (err) {
            console.error("Error adding to kasir:", err);
            res.status(500).json({ error: "Error adding to kasir" });
          } else {
            const newData = {
              idTransaksi,
              jumlah,
              idSKU
            };
            res.json({
              message: "Data added to kasir successfully",
              data: newData,
            });
          }
        }
      );
    }
  });
});

app.get("/products/idSKU/:namaProduk", (req, res) => {
  const namaProduk = req.params.namaProduk;

  const query = `
    SELECT p.idBarang, p.nama AS 'Nama Barang', s.skuCode AS 'Kode SKU'
    FROM products p
    JOIN skus s ON p.idBarang = s.idBarang
    WHERE p.nama = ?;
  `;

  connection.query(query, [namaProduk], (err, results) => {
    if (err) {
      console.error("Error fetching product by name:", err);
      res.status(500).json({ error: "Error fetching product by name" });
    } else {
      res.json({ data: results });
    }
  });
});

app.post('/insert-history', async (req, res) => {
  const { items } = req.body; // Get items from req.body
  console.log("Received data from frontend:", req.body);
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid data provided' });
  }

  // Get current date
  const currentDate = new Date().toISOString().split('T')[0];

  // Begin a new transaction using the connection
  connection.beginTransaction(async err => {
    if (err) {
      return res.status(500).json({ error: 'Error starting database transaction' });
    }

    items.forEach(async item => {
      const { idBarang, jumlah, idSKU, idTransaksi, jenisTransaksi } = item;
      const query = 'INSERT INTO history (tanggal, jumlah, idTransaksi, idBarang, idSKU, jenis_transaksi) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [currentDate, jumlah, idTransaksi, idBarang, idSKU, jenisTransaksi];

      try {
        const result = await connection.query(query, values);
        console.log('Inserted data into history table:', result);

        // Update the SKU quantity after successful history insertion
        const updateSkuQuery = "UPDATE skus SET stok = stok - ? WHERE idSKU = ?";
        connection.query(updateSkuQuery, [jumlah, idSKU], (err, updateResult) => {
          if (err) {
            connection.rollback(() => {
              console.error("Error updating SKU quantity:", err);
              res.status(500).json({ error: "Error updating SKU quantity" });
            });
          } else {
            console.log("Updated SKU quantity:", updateResult);
          }
        });
      } catch (err) {
        connection.rollback(() => {
          console.error('Error inserting data into history table:', err);
        });
        return; // Return here to prevent sending a success response as well
      }
    });

    // Commit the transaction
    connection.commit(err => {
      if (err) {
        connection.rollback(() => {
          console.error('Error committing transaction:', err);
        });
        return res.status(500).json({ error: 'Error committing transaction' });
      }

      res.status(200).json({ message: 'Transaction added to history successfully' });
    });
  });
});



app.get('/products/oldest/:idBarang', (req, res) => {
  const idBarang = req.params.idBarang;

  const query = `
    SELECT s.idSKU, s.inboundDate, p.nama
    FROM skus s
    JOIN products p ON s.idBarang = p.idBarang
    WHERE s.idBarang = ? 
    ORDER BY s.inboundDate ASC
    LIMIT 1
  `;

  connection.query(query, [idBarang], (err, results) => {
    if (err) {
      console.error('Error fetching oldest product:', err);
      res.status(500).json({ error: 'Error fetching oldest product' });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.json({ idSKU: null });
      }
    }
  });
});
