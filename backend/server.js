const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  //Database password
    database: ''    //Database name
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({ storage: storage });

app.post('/adminAddProduct', upload.single('image1'), (req, res) => {
    const { catid, name, price, description } = req.body;
    const imageUrl = req.file ? req.file.path : null; 

    const sql = 'INSERT INTO products (catid, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [catid, name, price, description, imageUrl], (err, result) => {
        if (err) throw err;
        console.log('Product added successfully!');
    });
});

app.post('/adminUpdateProduct', upload.single('image2'), (req, res) => {
    const { pid, name, price, description } = req.body;
    const imageUrl = req.file ? req.file.path : null; 

    const sql = 'UPDATE products SET name=?, price=?, description=?, image_url=? WHERE pid=?';
    db.query(sql, [name, price, description, imageUrl, pid], (err, result) => {
        if (err) throw err;
        console.log('Product updated successfully!');
    });
});

app.post('/adminDeleteProduct', (req, res) => {
    const { pid } = req.body;

    db.query('DELETE FROM products WHERE pid=?', [pid], (err, result) => {
        if (err) throw err;
        console.log('Product deleted successfully!');
        res.send(`Product with ID ${pid} deleted successfully.`);
    });
});

app.get('/', (req, res) => {
    db.query('SELECT * FROM categories', (err, categories) => {
        if (err) throw err;
        res.json(categories);
    });
});

app.get('/productList', (req, res) => {
    db.query('SELECT * FROM products', (err, products) => {
        if (err) throw err;
        res.json(products);
    });
});

app.get('/categories', (req, res) => {
    const catid = req.query.catid; 
    db.query('SELECT * FROM categories WHERE catid = ?', [catid], (err, products) => {
        if (err) throw err;
        res.json(products);
    });
});

app.get('/productPath', (req, res) => {
    const pid = req.query.pid; 
    db.query('SELECT * FROM products WHERE pid = ?', [pid], (err, products) => {
        if (err) throw err;
        res.json(products);
    });
});

app.get('/products', (req, res) => {
    const catid = req.query.catid; 
    db.query('SELECT * FROM products WHERE catid = ?', [catid], (err, products) => {
        if (err) throw err;
        res.json(products);
    });
});

app.get('/productInformation', (req, res) => {
    const pid = req.query.pid;
    db.query('SELECT * FROM products WHERE pid = ?', [pid], (err, product) => {

        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product); 
    });
});

app.get('/navigationcategoryPath', (req, res) => {
    const catid = req.query.catid;
    db.query('SELECT * FROM categories WHERE catid = ?', [catid], (err, category) => {
        if (err) throw err;
        res.json(category);
    });
});

app.get('/getProductDetails', (req, res) => {
    const { pid } = req.query;
    const sql = 'SELECT name, price FROM products WHERE pid = ?';
    db.query(sql, [pid], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.json(results[0]); 
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});