document.addEventListener("DOMContentLoaded", async () => {
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
  const switchElement = document.getElementById("selectRegister");

  let quantity = 1;
  let productList = [];

  const materialInput = document.getElementById("material");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const options = dropdownMenu.getElementsByClassName("option");

  // Mostrar o dropdown quando o input é focado
  materialInput.addEventListener("focus", () => {
    dropdownMenu.style.display = "block";
  });

  // Esconder o dropdown quando o input perde o foco
  materialInput.addEventListener("blur", () => {
    setTimeout(() => {
      dropdownMenu.style.display = "none";
    }, 200); // Timeout para permitir clique nas opções
  });

  // Filtrar as opções com base na entrada do usuário
  materialInput.addEventListener("input", () => {
    const filter = materialInput.value.toLowerCase();
    Array.from(options).forEach((option) => {
      const text = option.textContent || option.innerText;
      if (text.toLowerCase().indexOf(filter) > -1) {
        option.style.display = "";
      } else {
        option.style.display = "none";
      }
    });
  });

  // Atualizar o valor do input e esconder o dropdown quando uma opção é clicada
  Array.from(options).forEach((option) => {
    option.addEventListener("mousedown", (event) => {
      materialInput.value = event.target.getAttribute("data-value");
      dropdownMenu.style.display = "none";
    });
  });

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
  switchElement.addEventListener("change", function () {
    if (switchElement.checked) {
      showElement("registerForm");
      hideElement("registerJoia");
    } else {
      hideElement("registerForm");
      showElement("registerJoia");
    }
  });

  // Inicialmente esconder o elemento registerForm
  hideElement("registerForm");

  // Função para buscar produtos do servidor
  async function fetchProducts() {
    try {
      const response = await fetch("http://localhost:3000/products"); // URL do seu endpoint
      const products = await response.json();
      console.log(products);
      // Limpar o dropdown antes de adicionar novos itens
      productDropdown.innerHTML = "";

      // Adicionar a opção padrão
      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Selecione um produto";
      defaultOption.disabled = true;
      defaultOption.selected = false;
      productDropdown.appendChild(defaultOption);

      // Adicionar produtos ao dropdown
      products.forEach((product) => {
        const option = document.createElement("option");
        option.value = `${product.nome},${product.preco},${product.material}`;
        console.log(product.nome);
        option.textContent = product.nome;
        productDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // Buscar produtos ao carregar a página
  await fetchProducts();

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
    const selectedOption = productDropdown.selectedOptions[0];
    if (!selectedOption) {
      alert("Por favor, selecione um produto.");
      return;
    }

    const productInfo = selectedOption.value.split(",");
    const productName = productInfo[0];
    const productPrice = productInfo[1];
    const productMaterial = productInfo[2];
    const localInput = document.createElement("input");
    localInput.type = "text";
    localInput.className = "form__field local-input";

    const newRow = productTable.insertRow();
    newRow.innerHTML = `
      <td>${productName}</td>
      <td><input
            type="text"
            class="form__field valorAtk"
            step="0.01"
            min="0.00"
            max="999.99"
            value="${(productPrice * quantity).toFixed(2)}"
            maxlength="10"
            oninput="formatarPreco(this)"
          /></td>
      <td>
        <select class="material-dropdown">
          <option value="Aço Cirúrgico" ${
            productMaterial === "Aço Cirúrgico" ? "selected" : ""
          }>Aço Cirúrgico</option>
          <option value="Titânio" ${
            productMaterial === "Titânio" ? "selected" : ""
          }>Titânio</option>
          <option value="Nenhum" ${
            productMaterial === "Nenhum" ? "selected" : ""
          }>Nenhum</option>
        </select>
      </td>
      <td>${quantity}</td>
      <td><input
            type="text"
            class="form__field local-input"
          /></td>
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

    // Adicionar evento de input para atualizar o preço do produto
    newRow.querySelector(".valorAtk").addEventListener("input", (event) => {
      const newPrice = event.target.value;
      productList = productList.map((product) =>
        product.name === productName ? { ...product, price: newPrice } : product
      );
      updateFormData();
    });

    // Adicionar evento de change para atualizar o material do produto
    newRow
      .querySelector(".material-dropdown")
      .addEventListener("change", (event) => {
        const newMaterial = event.target.value;
        productList = productList.map((product) =>
          product.name === productName
            ? { ...product, material: newMaterial }
            : product
        );
        updateFormData();
      });

    // Adicionar evento de input para atualizar o local do produto
    newRow.querySelector(".local-input").addEventListener("input", (event) => {
      const newLocal = event.target.value;
      productList = productList.map((product) =>
        product.name === productName ? { ...product, local: newLocal } : product
      );
      updateFormData();
    });

    // Adicionar produto à lista de produtos
    productList.push({
      name: productName,
      price: productPrice,
      material: productMaterial,
      quantity: quantity,
      local: "",
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
    formObject.servico = productList;
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
    const url = "http://localhost:3000/registerJoia"; // URL do seu endpoint
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
    console.log(JSON.stringify(data, null, 2));

    // Enviar os dados para o backend
    const url = "http://localhost:3000/registerPessoa"; // URL do seu endpoint
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
