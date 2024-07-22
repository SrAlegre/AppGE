function consultaON() {
  buscarProdutos(); // Carrega todos os produtos inicialmente

  const dropdownContainer = document.getElementById("dropdownContainer");
  const selectedMaterial = document.getElementById("selectedMaterial");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const hiddenInput = document.getElementById("material");

  // Toggle dropdown menu visibility
  selectedMaterial.addEventListener("click", function () {
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  // Handle option selection
  dropdownMenu.addEventListener("click", function (event) {
    if (event.target.classList.contains("option")) {
      selectedMaterial.textContent = event.target.textContent;
      hiddenInput.value = event.target.getAttribute("data-value");
      dropdownMenu.style.display = "none";

      // Remove 'selected' class from other options
      dropdownMenu.querySelectorAll(".option").forEach((option) => {
        option.classList.remove("selected");
      });
      event.target.classList.add("selected");
    }

    
  });

  // Hide dropdown if clicked outside
  document.addEventListener("click", function (event) {
    if (!dropdownContainer.contains(event.target)) {
      dropdownMenu.style.display = "none";
    }
  });

  hideElement("form-consulta-pessoa");
  showElement("form-consulta-produto");
  document.getElementById("nome-pessoa").addEventListener("input", function () {
    const nome = this.value;

    fetch("http://localhost:3000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome }),
    })
      .then((response) => response.json())
      .then((data) => {
        const tbody = document.querySelector(".results-table tbody");
        tbody.innerHTML = "";

        data.forEach((item) => {
          const date = new Date(item.data);
          const formattedDate = date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const formattedValue = item.valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const row = document.createElement("tr");
          row.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.cpf}</td>
        <td>${formattedDate}</td>
        <td>R$ ${formattedValue}</td>
        <td>
          <button class="action-btn">
            <span id="btn-open_in_new" class="material-icons">open_in_new</span>
          </button>
        </td>
      `;
          tbody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
      });
  });






  
  document
    .getElementById("nome-produto")
    .addEventListener("input", function () {
      const nome = this.value;
      const material = document.getElementById("material").value; // Supondo que você tenha um campo para selecionar o material

      fetch("http://localhost:3000/search-produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, material }),
      })
        .then((response) => response.json())
        .then((data) => {
          const tbody = document.querySelector("#results-body-produto");
          tbody.innerHTML = "";

          data.forEach((item) => {
            const valor_vendido = item.preco.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const valor_de_atacado = item.preco_de_atacado.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            );

            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.material}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${valor_vendido}</td>
            <td>R$ ${valor_de_atacado}</td>

          `;
            tbody.appendChild(row);
          });
        })
        .catch((error) => {
          console.error("Erro ao buscar dados:", error);
        });
    });
}
consultaON();


document.getElementById("selectConsulta").addEventListener("change", function () {
  console.log("oi");
  if (document.getElementById("selectConsulta").checked) {
    showElement("form-consulta-pessoa");
    hideElement("form-consulta-produto");
  } else {
    hideElement("form-consulta-pessoa");
    showElement("form-consulta-produto");
  }
});

function showElement(id) {
  const element = document.getElementById(id);
  element.style.display = "block";
}

// Função para esconder um elemento
function hideElement(id) {
  const element = document.getElementById(id);
  element.style.display = "none";
}





// Função para preencher a tabela com os dados dos produtos
function preencherTabela(data) {
  const tbody = document.querySelector("#results-body-produto");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const valor_vendido = item.preco.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const valor_de_atacado = item.preco_de_atacado.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.material}</td>
      <td>${item.quantidade}</td>
      <td>R$ ${valor_vendido}</td>
      <td>R$ ${valor_de_atacado}</td>
    `;
    tbody.appendChild(row);
  });
}

// Função para buscar e atualizar a tabela com base no input
function buscarProdutos() {
  const nome = document.getElementById("nome-produto").value;
  const material = document.getElementById("material").value; // Supondo que você tenha um campo para selecionar o material

  fetch("http://localhost:3000/search-produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, material }),
  })
    .then((response) => response.json())
    .then((data) => {
      preencherTabela(data);
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });
}


// Adiciona ouvintes de eventos para atualizar a tabela conforme o usuário digita
document.getElementById("nome-produto").addEventListener("input", buscarProdutos);
document.getElementById("material").addEventListener("change", buscarProdutos);