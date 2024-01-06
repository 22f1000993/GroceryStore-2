const cart = Vue.component("cart", {
  template: `
    <div class="cart">
        <div class="cart-header">
            <h2>Cart</h2>
        </div>
        <div class="cart-body">
            <div class="cart-item">
            <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Order ID</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Product Name</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Category Name</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Total Price</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Quantity</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Order Date</th>
              <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Action</th>
            </tr>
            <tr  v-for="item in cartItems">
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.id}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.product}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.category}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.price}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.quantity}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">{{item.order_date}}</td>
                <td style="padding: 12px; border: 1px solid #cccccc;">
                  <button style="padding: 8px 15px; background-color: #546c1dd4; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 10px;" @click="deleteorder(item.id)">Delete</button>
                </td>
            </tr>
            </table>
            </div>
        </div>
        <br> <br>
        <div class="cart-footer">
            <h3>Total: Rs. {{total}}</h3>
        </div>
        <br> <br>
        <div>
        <router-link to="/login" style="padding: 8px 15px; background-color: #546c1dd4; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 10px;text-decoration: none;"> Pay & Checkout</router-link>
        </div>
    </div>
    `,
  data() {
    return {
      cartItems: [],
      total: 0,
    };
  },
  mounted() {
    this.fetchCartItems();
  },
  methods: {
    fetchCartItems() {
      const authToken = localStorage.getItem("auth-token");
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
          this.cartItems = data;
  
          // Calculate total based on the quantity of each item
          this.total = this.cartItems.reduce((acc, item) => {
            // Check if quantity is a valid number
            const price = Number(item.price);
            if (!isNaN(price)) {
              return acc + price;
            }
            return acc;
          }, 0);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    deleteorder(order_id) {
      const authToken = localStorage.getItem("auth-token");
      fetch(`/api/order/${order_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": authToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Order Deleted:", data);
          this.fetchCartItems();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default cart;
