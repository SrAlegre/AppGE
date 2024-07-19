const mysql = require("mysql");

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Seu usuário do MySQL
  password: "1234asdf", // Sua senha do MySQL
  database: "appge2", // Nome do banco de dados
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Conectado ao banco de dados!");
});

// Função para Converter 'nao' e 'sim' em 0 e 1
function convertToBoolean(value) {
  return value === "sim" ? 1 : 0;
}

// Função para converter vírgula para ponto em valores decimais
function formatDecimal(value) {
  if (typeof value === 'string') {
    return value.replace(',', '.');
  }
  // Se não for string, retorne o valor original ou trate de outra forma
  return value;
}

// Função para Cadastrar Produto
function cadastrarProduto(produto, callback) {
  let { nome, material, preco, preco_de_atacado, quantidade } = produto;
  preco = formatDecimal(preco);
  preco_de_atacado = formatDecimal(preco_de_atacado);

  const insertProdutoQuery = `
    INSERT INTO produtos (nome, material, preco, preco_de_atacado, quantidade)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    insertProdutoQuery,
    [nome, material, preco, preco_de_atacado, quantidade],
    (err, results) => {
      if (err) return callback(err);
      const id_produto = results.insertId;
      callback(null, id_produto);
    }
  );
}

// Função para Cadastrar Cliente
function cadastrarCliente(cliente, callback) {
  const {
    name,
    CPF,
    birthdate,
    phone,
    address,
    Instagram,
    alergia,
    peleCicatrizacao,
    cirurgia,
    ist: istValue,
    hepatites: hepatitesValue,
    cardiaco: cardiacoValue,
    medicamento,
    diabetes: diabetesValue,
    epilepsia: epilepsiaValue,
    hemofilia: hemofiliaValue,
    pressao,
    conheceu,
    servico,
  } = cliente;

  // Converter valores para booleanos
  const ist = convertToBoolean(istValue);
  const hepatites = convertToBoolean(hepatitesValue);
  const cardiaco = convertToBoolean(cardiacoValue);
  const diabetes = convertToBoolean(diabetesValue);
  const epilepsia = convertToBoolean(epilepsiaValue);
  const hemofilia = convertToBoolean(hemofiliaValue);

  // Inserir ficha de anamnese
  const insertAnamineseQuery = `
    INSERT INTO ficha_de_anaminese (alergia, pele_cicatrizacao, cirurgia, IST, Hepatites, cardiaco_circulatorio, medicamento, diabetes, epilepsia, hemofilia, pressao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    insertAnamineseQuery,
    [
      alergia,
      peleCicatrizacao,
      cirurgia,
      ist,
      hepatites,
      cardiaco,
      medicamento,
      diabetes,
      epilepsia,
      hemofilia,
      pressao,
    ],
    (err, results) => {
      if (err) return callback(err);

      const id_anaminese = results.insertId;

      // Inserir cliente
      const insertClienteQuery = `
      INSERT INTO cliente (nome,cpf, data_de_aniversario, telefone, endereco, instagram, como_conheceu, id_anaminese)
      VALUES (?,?, ?, ?, ?, ?, ?, ?)
    `;

      connection.query(
        insertClienteQuery,
        [name,CPF, birthdate, phone, address, Instagram, conheceu, id_anaminese],
        (err, results) => {
          if (err) return callback(err);

          const id_cliente = results.insertId;

          // Se o cliente tiver serviços, associe-os
          if (servico && servico.length > 0) {
            servico.forEach((produto) => {

              console.log("nome obtido", produto.nome);
              obterIdProdutoPorNome(produto.name, (err, id_produto) => {
                if (err) {
                  console.error("Erro ao obter id_produto:", err);
                } else {
                  associarProdutoServico(
                    id_cliente,
                    id_produto,
                    produto.quantity,
                    (err, id_servico) => {
                      if (err) {
                        console.error("Erro ao associar produto ao serviço:", err);
                      } else {
                        console.log("Serviço associado com sucesso, ID:", id_servico);
                      }
                    }
                  );
                }
              });
            });
          }

          callback(null, id_cliente);
        }
      );
    }
  );
}


// function obterIdProdutoPorNome(nome, callback) {
//   const query = "SELECT id_produto FROM produtos WHERE nome = ?";

//   connection.query(query, [nome], (err, results) => {
//     if (err) {
//       console.error("Erro ao buscar id_produto:", err);
//       callback(err, null);
//       return;
//     }
//     console.log('resultado',results);

//   });
// }





// Função para Associar Produto ao Serviço (Serviço do Cliente)
function associarProdutoServico(id_cliente, id_produto, quantidade, callback) {
  const insertServicoQuery = `
    INSERT INTO servico (id_cliente, id_produto, quantidade)
    VALUES (?, ?, ?)
  `;


  connection.query(
    insertServicoQuery,
    [id_cliente, id_produto, quantidade],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    }
  );
}

function getProducts(callback) {
  const query = "SELECT * FROM produtos";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
}

// Exemplo de uso
// Cadastro de um produto
const produto = {
  nome: "trasversal",
  material: "titanio",
  preco: 49.9,
  preco_de_atacado: 21.5,
  quantidade: 1,
};

// Cadastro de um cliente com o serviço associado
const cliente = {
  CPF: "987",
  birthdate: "0011-11-11",
  phone: "11",
  address: "tubarao",
  Instagram: "leomarvidalk",
  alergia: "tenho nd nao",
  peleCicatrizacao: "n",
  cirurgia: "s",
  ist: "nao",
  hepatites: "nao",
  cardiaco: "nao",
  medicamento: "sss",
  diabetes: "nao",
  epilepsia: "nao",
  hemofilia: "nao",
  pressao: "normal",
  conheceu: "s",
  servico: [
    {
      id_produto: 1, // ID do produto existente
      quantidade: 1,
    },
  ],
};

// Executar cadastro de cliente
// cadastrarCliente(cliente, (err, id_cliente) => {
//   if (err) {
//     console.error("Erro ao cadastrar cliente:", err);
//   } else {
//     console.log("Cliente cadastrado com sucesso, ID:", id_cliente);
//   }
// });

// cadastrarProduto(produto, (err, id_cliente) => {
//   if (err) {
//     console.error("Erro ao produto cliente:", err);
//   } else {
//     console.log("Produto cadastrado com sucesso, ID:", id_cliente);
//   }
// });

// Exportando as funções
module.exports = {
  cadastrarCliente,
  cadastrarProduto,
  getProducts,
};




function obterIdProdutoPorNome(nome, callback) {
  console.log(`Buscando id_produto para o nome: '${nome}'`); // Log para depuração
  const query = "SELECT id_produto FROM produtos WHERE nome = ?";

  connection.query(query, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar id_produto:", err);
      callback(err, null);
      return;
    }
    console.log('Resultados da busca:', results); // Log para depuração

    if (results.length > 0) {
      const id_produto = results[0].id_produto;
      callback(null, id_produto);
    } else {
      callback(new Error("Produto não encontrado"), null);
    }
  });
}
