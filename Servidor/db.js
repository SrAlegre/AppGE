// db.js
const mysql = require('mysql');
const util = require('util');

// Cria uma conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234asdf',
  database: 'appge'
});

// Promisify o método query para usar com async/await
const query = util.promisify(connection.query).bind(connection);

// Função para verificar se o produto existe
async function verificarProduto(produtoName) {
  const queryStr = 'SELECT id_produto FROM produto WHERE nome = ?';
  const results = await query(queryStr, [produtoName]);
  return results.length > 0 ? results[0].id_produto : null;
}

// Função para converter 'sim'/'não' para valores booleanos
function convertToBoolean(value) {
  return value === 'sim' ? 1 : 0;
}

// Função para inserir um cliente
// Função para inserir um cliente
async function inserirCliente(clienteData) {
  try {
    await query('START TRANSACTION');

    // Insere a ficha de anamnese
    const insertAnamneseQuery = `
      INSERT INTO anaminese (Alergia, pele_cicatrizacao, cirugia, hepatites, cardiaco, medicamento, epilepsia, hemofilia, pressao, ist, diabetes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const anamneseValues = [
      clienteData.alergia,
      clienteData.peleCicatrizacao,
      clienteData.cirurgia,
      convertToBoolean(clienteData.hepatites),
      convertToBoolean(clienteData.cardiaco),
      clienteData.medicamento,
      convertToBoolean(clienteData.epilepsia),
      convertToBoolean(clienteData.hemofilia),
      clienteData.pressao,
      convertToBoolean(clienteData.ist),
      convertToBoolean(clienteData.diabetes)
    ];
    const anamneseResult = await query(insertAnamneseQuery, anamneseValues);
    const idAnamnese = anamneseResult.insertId;

    console.log('Anamnese inserida com sucesso.');

    // Insere o cliente
    const insertClienteQuery = `
      INSERT INTO Cliente (Nome, CPF, Data_Nascimento, Telefone, Endereco, instagram, fk_anaminese_id_anaminese, conheceu)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const clienteValues = [
      clienteData.name,
      clienteData.CPF,
      clienteData.birthdate,
      clienteData.phone,
      clienteData.address,
      clienteData.Instagram,
      idAnamnese,
      clienteData.conheceu
    ];
    const clienteResult = await query(insertClienteQuery, clienteValues);
    const idCliente = clienteResult.insertId;

    console.log('Cliente inserido com sucesso.');

    // Verifica se o produto já existe e obtém o ID do produto
    const produtoPromises = clienteData.produtos.map(async produto => {
      const produtoId = await verificarProduto(produto.name);
      if (produtoId) {
        return { produtoId, quantidade: produto.quantity };
      }
      return null;
    });

    const produtosAssociados = (await Promise.all(produtoPromises)).filter(p => p !== null);

    if (produtosAssociados.length > 0) {
      // Insere a associação do cliente com os produtos
      const insertTemQuery = `
        INSERT INTO tem (fk_Cliente_id_pessoa, fk_produto_id_produto, quantidade)
        VALUES ?
      `;
      const temValues = produtosAssociados.map(p => [idCliente, p.produtoId, p.quantidade]);
      await query(insertTemQuery, [temValues]);

      console.log('Cliente associado aos produtos com sucesso.');
      await query('COMMIT');
      return 'Cliente inserido e associado com sucesso.';
    } else {
      console.log('Nenhum produto encontrado para associação.');
      await query('ROLLBACK');
      return 'Cliente inserido, mas nenhum produto encontrado para associação.';
    }
  } catch (err) {
    console.error('Erro ao inserir cliente:', err);
    await query('ROLLBACK');
    throw err;
  }
}


module.exports = {
  inserirCliente,
  verificarProduto
};
