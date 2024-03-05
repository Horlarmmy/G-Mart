import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/Market.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x1dD9772541d364b6A09EF89816255e64d9075930"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let gadgets = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function () {
  const _productLength = await contract.methods.getProductsLength().call()
  const _gadgets = []
  for (let i = 0; i < _productLength; i++) {
    let _gadget = new Promise(async (resolve, reject) => {
      let product = await contract.methods.readProduct(i).call()
      resolve({
        index: i,
        owner: product[0],
        name: product[1],
        image: product[2],
        description: product[3],
        location: product[4],
        price: new BigNumber(product[5]),
        sold: product[6],
        upvotes: product[7],
        reviews: product[8]
      })
    })
    _gadgets.push(_gadget)
  }
  gadgets = await Promise.all(_gadgets)

  renderProducts()
}

const renderProducts = async () => {
  document.getElementById("marketplace").innerHTML = "";
  gadgets.forEach(_gadget => {
    const newDiv = document.createElement("div");
    newDiv.className = "col-md-4";
    newDiv.innerHTML = productTemplate(_gadget);
    document.getElementById("marketplace").appendChild(newDiv);
  });
};

const renderReviews = async (index) => {
  document.getElementById("reviews").innerHTML = "";
  const reviews = gadgets[index].reviews;
  console.log(index)
  reviews.forEach(_review => {
    const newDiv = document.createElement("div");
    const reviewTemp = document.createElement("div");
    const imgDiv = document.createElement('div')
    imgDiv.innerHTML = identiconTemplate(_review[0])
    newDiv.className = "col-md-10";
    imgDiv.className = "col-md-2";
    newDiv.innerHTML = `${_review[1]}`;
    reviewTemp.style.padding = "15px"
    reviewTemp.className = "row";
    reviewTemp.appendChild(imgDiv)
    reviewTemp.appendChild(newDiv)
    document.getElementById("reviews").appendChild(reviewTemp);
  });
  document.getElementById("addReviewBtn").dataset.id = index
};

function productTemplate(_gadget) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src=${_gadget.image} alt="${_gadget.name}...">
      <div class="position-absolute top-0 begin-0 bg-warning mt-4 me-2 px-2 py-1 rounded">
        ${_gadget.upvotes} Upvotes
      </div>
      <div class="position-absolute top-0 end-0 bg-warning mt-4 me-2 px-2 py-1 rounded">
        ${_gadget.sold} Sold
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_gadget.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_gadget.name}</h2>
        <p class="card-text mb-4" style="min-height: 20px; font-weight: 500;">
        ${_gadget.description}             
        </p>
        <p class="card-text mb-4" style="min-height: 20px; font-weight: 500;">
        Location: ${_gadget.location}             
        </p>

        <div class="d-grid gap-2">
          <a
          class="btn btn-dark rounded-pill reviewsBtn"
          data-bs-toggle="modal"
          data-bs-target="#reviewsModal"
          id=${_gadget.index}
        >
          Reviews (${_gadget.reviews.length})
        </a>
        <a class="btn btn-lg btn-outline-dark like fs-6 p-3" id=${_gadget.index}>
            Upvote
          </a>
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${_gadget.index}>
            Buy for ${_gadget.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});


document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newDescription").value,
      document.getElementById("newLocation").value,
      new BigNumber(document.getElementById("newPrice").value)
        .shiftedBy(ERC20_DECIMALS)
        .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .writeProduct(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(gadgets[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${gadgets[index].name}"...`)
    try {
      const result = await contract.methods
        .buyProduct(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully bought "${gadgets[index].name}".`)
      getProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})

document.querySelector('#marketplace').addEventListener('click', async (e) => {
  if (e.target.className.includes("like")) {
    const index = e.target.id;
    console.log(index);
    console.log(gadgets[index]);
    notification(`⌛ Upvoting ${gadgets[index].name}...`);
    try {
      const result = await contract.methods.upvoteProduct(index).send({ from: kit.defaultAccount });
      notification(`🎉 You upvoted "${gadgets[index].name}".`);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
    getProducts();
  }
});

document.querySelector('#marketplace').addEventListener('click', async (e) => {
  if (e.target.className.includes("reviewsBtn")) {
    const index = e.target.id;
    console.log(index);
    console.log(gadgets[index]);
    renderReviews(index);
  }
});

document
  .querySelector("#addReviewBtn")
  .addEventListener("click", async (e) => {
    const params = document.getElementById("newReview").value
    console.log(params);
    const index = e.target.dataset.id
    console.log(index)
    notification(`⌛ Adding Review...`)
    try {
      const result = await contract.methods
      .dropReview(index, params)
      .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added a Review.`)
    getProducts()
  })

document.querySelector('#marketplace').addEventListener('click', async (e) => {
  if (e.target.className.includes("read")) {
    const index = e.target.dataset.id;
    let val = gadgets[index].read
    if (!val) {
      notification(`⌛ Waiting to mark ${gadgets[index].title} as Read...`);


      try {
        const result = await contract.methods.markAsRead(index).send({ from: kit.defaultAccount });

        notification(`🎉 You successfully marked "${gadgets[index].title}" as Read.`);
      } catch (error) {
        notification(`⚠️ ${error}.`);
      }
    } else {
      notification(`⌛ Waiting to mark ${gadgets[index].title} as UnRead...`);
      try {
        const result = await contract.methods.markAsUnRead(index).send({ from: kit.defaultAccount });

        notification(`🎉 You successfully marked "${gadgets[index].title}" as UnRead.`);
        console.log(e.target);
      } catch (error) {
        notification(`⚠️ ${error}.`);
      }
    }
    getProducts();

  }
});