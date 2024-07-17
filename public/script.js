// Função para mostrar um elemento
function showElement(id) {
  const element = document.getElementById(id);
  element.style.display = "block";
}

// Função para esconder um elemento
function hideElement(id) {
  const element = document.getElementById(id);
  element.style.display = "none";
}

// Alternar exibição com base no estado do switch
const switchElement = document.getElementById("selectRegister");

switchElement.addEventListener("change", function () {
  if (switchElement.checked) {
    showElement("registerForm");
    hideElement("registerJoia");
  } else {
    hideElement("registerForm");
    showElement("registerJoia");
  }
});

// Inicialmente esconder o elemento (opcional)
hideElement("registerForm");

document.addEventListener("DOMContentLoaded", () => {
  const productDropdown = document.getElementById("product-dropdown");
  const quantityElement = document.getElementById("quantity");
  const incrementButton = document.getElementById("increment");
  const decrementButton = document.getElementById("decrement");
  const addButton = document.getElementById("add-product");
  const productTable = document
    .getElementById("product-table")
    .getElementsByTagName("tbody")[0];
  const registerForm = document.getElementById("registerForm");

  const registerJoia = document.getElementById("registerJoia");

  let data = "";

  let quantity = 1;
  let productList = [];

  // Incrementar quantidade
  incrementButton.addEventListener("click", () => {
    quantity++;
    quantityElement.textContent = quantity;
  });

  // Decrementar quantidade
  decrementButton.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      quantityElement.textContent = quantity;
    }
  });

  // Adicionar produto à tabela
  addButton.addEventListener("click", () => {
    const productInfo = productDropdown.value.split(",");
    const productName = productInfo[0];
    const productPrice = productInfo[1];
    const productMaterial = productInfo[2];

    const newRow = productTable.insertRow();
    newRow.innerHTML = `
          <td>${productName}</td>
          <td><input
                type="text"
                class="form__field valorAtk"
                id="valorAtk"
                step="1.0"
                min="0,00"
                max="999,999"
                value=${productPrice}
                maxlength="10"
                oninput="formatarPreco(this)"
              /></td>
          <td>${productMaterial}</td>
          <td>${quantity}</td>
          <td><button type="button" class="delete-button">Remover</button></td>
      `;

    // Adicionar evento de clique no botão de remover
    newRow.querySelector(".delete-button").addEventListener("click", () => {
      newRow.remove();
      productList = productList.filter(
        (product) => product.name !== productName
      );
      updateFormData();
    });

    // Adicionar produto à lista de produtos
    productList.push({
      name: productName,
      price: productPrice,
      material: productMaterial,
      quantity: quantity,
    });

    // Resetar quantidade para 1
    quantity = 1;
    quantityElement.textContent = quantity;

    // Atualizar objeto de FormData
    updateFormData();
  });

  // Atualizar objeto FormData com a lista de produtos
  function updateFormData() {
    const formData = new FormData(registerForm);
    const formObject = Object.fromEntries(formData.entries());
    formObject.produtos = productList;
    data = formObject;
  }

  function updateFormJoia() {
    const formData = new FormData(registerJoia);
    const formObject = Object.fromEntries(formData.entries());
    data = formObject;
  }

  registerJoia.addEventListener("submit", async function (event) {
    event.preventDefault();
    await updateFormJoia(); // Garante que os dados estão atualizados

    // Enviar os dados para o backend
    const url = "http://localhost:3000/register"; // URL do seu endpoint
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data, null, 2), // `data` é o objeto JSON que você quer enviar
    };

    try {
      const response = await fetch(url, options);
      const responseData = await response.json(); // Se o servidor responder com JSON
      console.log("Resposta do servidor:", responseData);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
    document.getElementById("registerJoia").reset();
  });

  // Impedir envio padrão do formulário e atualizar dados no console
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    await updateFormData(); // Garante que os dados estão atualizados

    // Enviar os dados para o backend
    const url = "http://localhost:3000/register"; // URL do seu endpoint
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data, null, 2), // `data` é o objeto JSON que você quer enviar
    };

    try {
      const response = await fetch(url, options);
      const responseData = await response.json(); // Se o servidor responder com JSON
      console.log("Resposta do servidor:", responseData);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
     productList = [];
    document.getElementById("registerForm").reset();

  });

  // Evitar validação automática ao clicar nos botões de incremento e decremento
  incrementButton.addEventListener("click", (event) => {
    event.preventDefault();
  });

  decrementButton.addEventListener("click", (event) => {
    event.preventDefault();
  });
  addButton.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

function formatarPreco(input) {
  // Salva a posição atual do cursor
  const pos = input.selectionStart;

  // Remove todos os caracteres não numéricos
  let preco = input.value.replace(/\D/g, "");

  // Remove zeros à esquerda
  preco = preco.replace(/^0+/, "");

  // Se o preço é vazio, não faz nada
  if (preco === "") {
    input.value = "";
    return;
  }

  // Formata o preço conforme a quantidade de dígitos
  if (preco.length === 1) {
    input.value = "0,0" + preco;
  } else if (preco.length === 2) {
    input.value = "0," + preco;
  } else {
    let parteInteira = preco.slice(0, -2);
    let parteDecimal = preco.slice(-2);
    input.value = parteInteira + "," + parteDecimal;
  }

  // Ajusta a posição do cursor para o final
  input.setSelectionRange(input.value.length, input.value.length);
}
