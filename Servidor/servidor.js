const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

app.post('/register', (req, res) => {
    const formData = req.body;
    console.log(formData); // Exibe os dados recebidos do formulário no console

    res.status(200).json({ message: 'Dados recebidos com sucesso!' });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
