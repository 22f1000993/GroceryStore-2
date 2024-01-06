export default {
  template: `
  <div style="font-family: Arial, sans-serif;">
  <h1 style="text-align:center">Welcome to Grocery Store</h1>
  {{orderConfirmation}}
  <router-link to="/cart" style="padding: 8px 15px; background-color: #546c1dd4; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 10px;text-decoration: none;">Click to see your cart</router-link>
  {{msgg}}
  <div v-if="showProductsOrdered && ProductsOrdered.length > 0" style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-bottom: 10px;">
    <h3>Products Ordered</h3>  <button @click="trigger_celery_job" style="padding: 8px 15px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Download Products Ordered</button>
    <br> <br>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li v-for="order in ProductsOrdered" :key="order.id">
        <strong>Product Name:</strong> {{ order.product_name }}<br>
        <strong>Category:</strong> {{ order.category }}<br>
        <strong>Order Date:</strong> {{ order.order_date }}<br>
        <strong>Ordered by</strong> {{ order.user }}<br>
        <div style="margin-top: 10px;">
        <button @click="rateProductsOrdered(order.product_id, order.product_name)" style="padding: 5px 10px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Rate Product</button>
        </div>
        <hr style="margin: 10px 0;">
      </li>
    </ul>
  
  </div>
  <!-- Search form -->
  <form @submit.prevent="searchProducts" style="display: flex; align-items: center; margin-bottom: 20px;">
    <input type="text" v-model="searchQuery.query" placeholder="Enter Product Name" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-right: 10px; flex: 1;">
    <select v-model="searchOption" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-right: 10px;">
      <option value="product_name">Search by Product Name</option>
    </select>
    <button type="submit" style="padding: 10px 20px; background-color: #546c1dd4; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Search</button>
  </form>

  <!-- Display search results -->
<div v-if="searchResults.length > 0">
  <h3>Search Results</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Product ID</th>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Product Name</th>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Price</th>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Manufacturing</th>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Expiry</th>
      <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Actions</th>
    </tr>
    <tr v-for="result in searchResults" :key="result.product_id">
      <td style="padding: 12px; text-align: center;">{{ result.product_id }}</td>
      <td style="padding: 12px; text-align: center;">{{ result.product_name }}</td>
      <td style="padding: 12px; text-align: center;">{{ result.price }}</td>
      <td style="padding: 12px; text-align: center;">{{ result.manufacturing_date }}</td>
      <td style="padding: 12px; text-align: center;">{{ result.expiry_date }}</td>
      <td style="padding: 12px; text-align: center;">
        <button @click="orderProduct(product_id, product_name, category_name)" style="background-color: #546c1dd4; color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Add To Cart</button>
        <input type="number" v-model="quantity[result.product_id]" @change="validateQuantityInput(result.product_id)" min="1" style="width: 50px; margin-left: 5px;">
      </td>
    </tr>
  </table>
</div>
  <div v-else>
    <p>No results found.</p>
  </div>
  
  
<!-- Inventory table -->
<h3> Products we offer </h3>
<table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Product ID</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Product Name</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Price</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Manufacturing</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Expiry</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Category</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Actions</th>
        </tr>
        <tr v-for="product in products" :key="product.ID">
          <td style="padding: 12px; text-align: center;">{{ product.ID }}</td>
          <td style="padding: 12px; text-align: center;">{{ product.Product }}</td>
          <td style="padding: 12px; text-align: center;">{{ product.Price }}</td>
          <td style="padding: 12px; text-align: center;">{{ product.Manufacturing }}</td>
          <td style="padding: 12px; text-align: center;">{{ product.Expiry }}</td>
          <td style="padding: 12px; text-align: center;">{{ product.Categories }}</td>
          <td style="padding: 12px; text-align: center;">
      <button @click="orderProduct(product.ID, product.Product, product.Categories)" style="background-color: #546c1dd4; color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Add To Cart</button>
      <input type="number" v-model="quantity[product.ID]" min="1" style="width: 50px; margin-left: 5px;">
      </td>
  </tr>
</table>
  </div>      
`,

  data() {
    return {
      products: [],
      username: "",
      searchResults: [],
      searchQuery: {
        query: "",
      },
      searchOption: "product_name", // Default search option is 'name'
      orderConfirmation: null,
      ProductsOrdered: [],
      showProductsOrdered: false,
      id: "",
      quantity: {},
      welcomePosition: "100%",
      ermsgg: "",
      showmsgg: false,
      msgg: "",
      showmsg: false,
      cart: [],
    };
  },

  mounted() {
    this.fetchProducts();
    //this.fetchUsername();
  },

  methods: {
    fetchProducts() {
      fetch("/api/products") // <-- Updated endpoint name
        .then((response) => response.json())
        .then((data) => {
          console.log("Products:", data);
          this.products = data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    trigger_celery_job: function () {
      fetch(`/trigger_celery_job`)
        .then((r) => r.json())
        .then((d) => {
          console.log("celery task details:", d);
          window.location.href = "/download_file";
        });
    },

    rateProductsOrdered(product_id, product_name) {
      const rating = prompt(`Please rate ${product_name} (1-5):`);

      if (rating >= 1 && rating <= 5) {
        const authToken = localStorage.getItem("Auth-token");
        if (authToken) {
          fetch(`/api/rating/${product_id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": authToken,
            },
            body: JSON.stringify({ rating: rating }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              this.msgg = data.message;
              this.fetchProducts();
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }
      } else {
        alert("Please enter a valid rating between 1 and 5.");
      }
    },

    fetchUsername() {
      const authToken = localStorage.getItem("auth-token");
      if (authToken) {
        fetch("/api/get_user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            this.user = data.user;
            this.id = data.user_id;
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    },

    validateQuantityInput(product_id) {
      // Ensure the input value is greater than or equal to 1
      if (this.quantity[product_id] < 1) {
        this.quantity[product_id] = 1;
      }
    },

    searchProducts() {
      const query = this.searchQuery.query.trim();
      const searchOption = this.searchOption;

      if (query) {
        let queryParam;
        // Set the appropriate query parameter based on the search option
        if (searchOption === "product_name") {
          queryParam = `product_name=${query}`;
        } else if (searchOption === "category_name") {
          queryParam = `category_name=${query}`;
        } else if (searchOption === "price") {
          queryParam = `price=${query}`;
        }

        let apiEndpoint;
        if (searchOption === "product_name") {
          apiEndpoint = "/api/search_product";
        } else {
          apiEndpoint = "/api/search_category";
        }

        fetch(`${apiEndpoint}?${queryParam}`)
          .then((response) => response.json())
          .then((data) => {
            console.log("Search Results:", data); // Add this line
            this.searchResults = data;
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        this.searchResults = [];
      }
    },

    fetchProductsOrdered() {
      const authToken = localStorage.getItem("Auth-token");
      if (authToken) {
        fetch(`/api/order`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": authToken,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Products Ordered:", data);
            this.ProductsOrdered = data;
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    },

    toggleProductsOrdered() {
      this.showProductsOrdered = !this.showProductsOrdered;
      if (this.showProductsOrdered) {
        this.fetchProductsOrdered();
      } else {
        this.orderConfirmation = null;
      }
    },

    orderProduct(product_id, product_name, category_name) {
      console.log("Product ID:", product_id);
      const orderData = {
        product_id: product_id,
        product_name: product_name,
        category_name: category_name,
        quantity: this.quantity[product_id] || 1,
      };
      const token = localStorage.getItem("auth-token");
      fetch("/api/order/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token,
        },
        body: JSON.stringify(orderData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Order failed. The products are out of stock or there was an error during this order."
            );
          }
          return response.json();
        })
        .then((data) => {
          this.orderConfirmation = `You have successfully ordered ${orderData.quantity} unit(s) for ${product_name}.`;
          console.log("Order response:", data);
          console.log(orderData.quantity);
          // Perform any necessary actions after order
        })
        .catch((error) => {
          console.error("Order failed:", error);
          this.orderConfirmation =
            "Order failed. The products are out of stock or there was an error during this order.";
        });
    },
  },
};
