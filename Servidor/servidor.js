const express = require("express");
const cors = require("cors");
const db = require("./db"); // Importar o arquivo db.js
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/registerPessoa", (req, res) => {
  const formData = req.body;
  console.log(formData); // Exibe os dados recebidos do formulário no console
  db.cadastrarCliente(formData, (err) => {
    if (err) {
      console.error("Erro ao cadastrar cliente:", err);
    } else {
      res.status(200).json({ message: "Dados recebidos com sucesso!" });
    }
  });
});

app.use(express.urlencoded({ extended: true }));

app.post('/search', (req, res) => {
  const nome = req.body.nome;  // Obtendo dados do corpo da requisição
  
  db.consultaCliente(nome, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Erro ao buscar dados' });
      return;
    }
    res.json(results);
  });
});

app.post('/search-produtos', (req, res) => {
  const { nome, material } = req.body; // Recebendo os dados do frontend

  db.consultaProduto(nome, material, (error, results) => {
    if (error) {
      res.status(500).send('Erro interno do servidor');
      return;
    }
    console.log(results)
    res.json(results);
  });
});


app.post("/registerJoia", (req, res) => {
  const formData = req.body;
  console.log(formData); // Exibe os dados recebidos do formulário no console
  db.cadastrarProduto(formData, (err) => {
    if (err) {
      console.error("Erro ao produto cliente:", err);
    } else {
      res.status(200).json({ message: "Dados recebidos com sucesso!" });
    }
  });
});

app.get("/products", (req, res) => {
  db.getProducts((err, products) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(products);
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
