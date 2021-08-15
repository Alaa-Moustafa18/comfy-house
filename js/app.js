const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];

//buttons
let buttonsDom = [];

// getting the products
class Products {
  async getProducts() {
    try {
      const result = await (await fetch("products.json")).json();
      const products = result.items.map((item) => {
        const { price, title } = item.fields;
        const image = item.fields.image.fields.file.url;
        const { id } = item.sys;

        return { price, title, image, id };
      });
      return products;
    } catch (error) {
      console.log("error", error);
    }
  }
}

class UI {
  displayProducts(products) {
    let res = "";

    products.forEach((item) => {
      res += ` <!-- single product -->
      <article class="product">
        <div class="img-container">
          <img
            src=${item.image}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${item.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
        </div>
        <h3>${item.title}</h3>
        <h4>$${item.price}</h4>
      </article>
      <!-- end of single product -->`;
    });
    productsDOM.innerHTML = res;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDom = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.disabled = true;
        //get product from products
        let cartItem = { ...appStorage.getProduct(id), amount: 1 };

        //add product to cart
        cart = [...cart, cartItem];
        // save cart to localstorage
        appStorage.saveCart(cart);
        //set cart value
        this.setCartValue(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }

  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.amount * item.price;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `            <img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down"data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  setupApp() {
    cart = appStorage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => this.clearCart());
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        appStorage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          appStorage.saveCart(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    appStorage.saveCart(cart);
    let button = this.getSignleButtonDom(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
  }
  getSignleButtonDom(id) {
    return buttonsDom.find((button) => button.dataset.id === id);
  }
}

// class Storage

class appStorage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((item) => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup App
  ui.setupApp();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      appStorage.saveProducts(products);
    })
    .then((_) => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
