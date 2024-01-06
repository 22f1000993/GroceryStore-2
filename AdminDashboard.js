export default {
  template: `
    <div style="font-family: Arial, sans-serif;">
    <div> <h1> Welcome Admin </h1></div>
      <h3>Pending Category Requests</h3>
    <table>
      <tr v-for="request in pendingCategoryRequests" :key="request.id">
        <td>{{ request.category_name }}</td>
        <td>{{ request.description }}</td>
        <td>{{ request.action_type }}</td>
        <td>{{ request.status }}</td>
        <td>
          <button @click="approveRequest(request.id)">Approve</button>
          <button @click="rejectRequest(request.id)">Reject</button>
        </td>
      </tr>
    </table>
      <h3>Available Categories In The Grocery Store</h3>
      <button type="button" @click="openCreateCategoryPopup" style="padding: 10px 20px; background-color: #556b2f; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Create New Category</button>

      <div v-if="createCategoryPopup" class="modal" style="display: block; position: fixed; z-index: 1; padding-top: 100px; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.4);">
        <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 50%;">
          <h3>Create New Category</h3>
          <form @submit.prevent="createCategory">
            <div style="margin-bottom: 10px;">
              <label for="category">Category Name:</label>
              <input type="text" id="category" v-model="newCategory.name" required style="padding: 10px;">
            </div>
            <div style="display: flex; justify-content: space-between;">
              <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Create Category</button>
              <button type="button" @click="closeCreateCategoryPopup" style="padding: 10px 20px; background-color: #dc3545; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 12px; background-color: #ccccccd4; color: #546c1dd4;">Category ID</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #546c1dd4;">Category Name</th>
          <th style="padding: 12px; background-color: #ccccccd4; color: #556b2f;">Actions</th>
        </tr>
        <tr v-for="category in categories" :key="category.id">
          <td style="padding: 12px; text-align:center;">{{ category.id }}</td>
          <td style="padding: 12px; text-align:center;">{{ category.Category_name }}</td>
          <td style="padding: 12px; text-align:center;">
            <button @click="openEditModal(category)" style="background-color: #546c1dd4; text-align:center;color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
            <button @click="confirmCategoryDelete(category.id)" style="background-color: #546c1dd4; text-align:center;color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
            </td>
        </tr>
      </table>

      <div v-if="editModalOpen" class="modal" style="display: block; position: fixed; z-index: 1; padding-top: 100px; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.4);">
        <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 80%;">
          <h3>Edit Category</h3>
          <form @submit.prevent="updateCategory">
            <label for="edit-category">Category Name:</label>
            <input type="text" id="edit-category" v-model="editedCategory.name" required style="padding: 10px; margin-bottom: 10px;">
            <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Update</button>
            <button type="button" @click="closeEditModal" style="padding: 10px 20px; background-color: #dc3545; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
          </form>
        </div>
      </div>
      <h3>Available Products In The Grocery Store</h3>
      <button type="button" @click="openCreateProductModal" style="padding: 10px 20px; background-color: #556b2f; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Create New Product</button>
  <div v-if="createProductModalOpen" class="modal" style="display: block; position: fixed; z-index: 1; padding-top: 100px; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.4);">
    <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 80%;">
      <h3>Create New Product</h3>
      <form @submit.prevent="createProduct">
    <label for="new-product-name">Product Name:</label>
    <input type="text" id="new-product-name" v-model="newProduct.name" required style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-manufacturing-date">Manufacturing Date:</label>
    <input type="datetime-local" id="new-product-manufacturing-date" v-model="newProduct.mfg" style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-expiry-date">Expiry Date:</label>
    <input type="datetime-local" id="new-product-expiry-date" v-model="newProduct.exp" style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-price">Price:</label>
    <input type="number" id="new-product-price" v-model="newProduct.price" required style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-unit">Unit:</label>
    <input type="text" id="new-product-unit" v-model="newProduct.unit" style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-quantity">Available Quantity:</label>
    <input type="number" id="new-product-quantity" v-model="newProduct.quantity" style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-category">Category:</label>
    <input type="text" id="new-product-category" v-model="newProduct.category" required style="padding: 10px; margin-bottom: 10px;">

    <label for="new-product-description">Description:</label>
    <textarea id="new-product-description" v-model="newProduct.description" style="padding: 10px; margin-bottom: 10px;"></textarea>

    <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Create Product</button>
    <button type="button" @click="closeCreateProductModal" style="padding: 10px 20px; background-color: #dc3545; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
</form>

    </div>
  </div>
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
            <button @click="openEditProductModal(product)" style="background-color: #546c1dd4; color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
            <button @click="confirmProductDelete(product.ID)" style="background-color: #546c1dd4; color: #ccccccd4; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
            </td>
        </tr>
      </table>

      <div v-if="editProductModalOpen" class="modal" style="display: block; position: fixed; z-index: 1; padding-top: 100px; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.4);">
        <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 80%;">
          <h3>Edit Product</h3>
          <form @submit.prevent="updateProduct">
            <label for="edit-product-name">Product Name:</label>
            <input type="text" id="edit-product-name" v-model="editedProduct.name" required style="padding: 10px; margin-bottom: 10px;">
            <label for="edit-product-price">Price:</label>
            <input type="number" id="edit-product-price" v-model="editedProduct.price" required style="padding: 10px; margin-bottom: 10px;">
            <label for="edit-product-category">Category:</label>
            <input type="text" id="edit-product-category" v-model="editedProduct.category" required style="padding: 10px; margin-bottom: 10px;">
            <label for="edit-product-manufacturing">Manufacturing Date:</label>
            <input type="text" id="edit-product-manufacturing" v-model="editedProduct.manufacturing" required style="padding: 10px; margin-bottom: 10px;">
            <label for="edit-product-expiry">Expiry Date:</label>
            <input type="text" id="edit-product-expiry" v-model="editedProduct.expiry" required style="padding: 10px; margin-bottom: 10px;">
            <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Update</button>
            <button type="button" @click="closeEditProductModal" style="padding: 10px 20px; background-color: #dc3545; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
          </form>
        </div>
      </div>
    
    </div>
  `,
  data() {
    return {
      products: [],
      categories: [],
      pendingCategoryRequests: [],
      msg: "",
      newProduct: {
        name: "",
        price: 0,
        mfg: "",
        exp: "",
        unit: "",
        quantity: 0,
        description: "",
        category: "",
      },
      newCategory: {
        name: "",
      },
      editProductModalOpen: false,
      editModalOpen: false,
      editedProduct: {
        id: null,
        name: "",
        price: 0,
        category: "",
      },
      createProductModalOpen: false,
      editCategoryOpen: false,
      createCategoryPopup: false,
      editedCategory: {
        id: null,
        name: "",
      },
    };
  },

  mounted() {
    this.fetchCategories();
    this.fetchProducts();
    this.fetchPendingCategoryRequests();
  },
  methods: {
    fetchCategories() {
      fetch("/api/categories")
        .then((response) => response.json())
        .then((data) => {
          this.categories = data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
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
    fetchPendingCategoryRequests() {
      fetch("/api/admin_category_requests")
        .then((response) => response.json())
        .then((data) => {
          this.pendingCategoryRequests = data.filter(
            (request) => request.status === "pending"
          );
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    approveRequest(id) {
      fetch(`/api/approve_category_request/${id}`, {
        method: "PUT",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          this.fetchPendingCategoryRequests();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    rejectRequest(id) {
      fetch(`/api/reject_category_request/${id}`, {
        method: "PUT",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          this.fetchPendingCategoryRequests();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    openEditProductModal(product) {
      this.editedProduct.id = product.id;
      this.editedProduct.name = product.name;
      this.editedProduct.price = product.price;
      this.editedProduct.category = product.category;
      this.editProductModalOpen = true;
    },
    closeEditProductModal() {
      this.editProductModalOpen = false;
    },
    openCreateCategoryPopup() {
      this.createCategoryPopup = true;
    },
    closeCreateCategoryPopup() {
      this.createCategoryPopup = false;
    },
    createCategory() {
      fetch("/api/create_category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_name: this.newCategory.name,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Category created:", data);
          this.fetchCategories();
          this.newCategory.name = "";
          this.closeCreateCategoryPopup();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    createProduct() {
      fetch("/api/create_product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.newProduct.name,
          price: this.newProduct.price,
          category: this.newProduct.category,
          mfg: this.newProduct.mfg,
          exp: this.newProduct.exp,
          unit: this.newProduct.unit,
          quantity: this.newProduct.quantity,
          description: this.newProduct.description,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Product created:", data);
          this.fetchProducts();
          this.newProduct.name = "";
          this.newProduct.price = 0;
          this.newProduct.category = "";
          this.closeCreateProductModal();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    confirmProductDelete(id) {
      if (window.confirm("Are you sure you want to delete this product?")) {
        this.deleteProduct(id);
      }
    },
    deleteProduct(id) {
      fetch(`/api/delete_product/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Product deleted:", data);
          this.fetchProducts();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    confirmCategoryDelete(id) {
      if (window.confirm("Are you sure you want to delete this category?")) {
        this.deleteCategory(id);
      }
    },
    deleteCategory(id) {
      fetch(`/api/delete_category/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Category deleted:", data);
          this.msg = data.message;
          this.fetchProducts();
          this.fetchCategories();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    openEditModal(category) {
      this.editedCategory.id = category.id;
      this.editedCategory.name = category.Category_name;
      this.editModalOpen = true;
    },
    closeEditModal() {
      this.editModalOpen = false;
    },
    updateCategory() {
      const id = this.editedCategory.id;
      const { name } = this.editedCategory;
      fetch(`/api/edit_category/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: name }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Category updated:", data);
          this.fetchCategories();
          this.closeEditModal();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    openEditProductModal(product) {
      this.editedProduct.id = product.product_id;
      this.editedProduct.name = product.product_name;
      this.editedProduct.price = product.price;
      this.editedProduct.category = product.category;
      this.editProductModalOpen = true;
      console.log(this.editedProduct);
    },
    closeEditProductModal() {
      this.editProductModalOpen = false;
    },
    updateProduct() {
      const id = this.editedProduct.id;
      const { name, price, category } = this.editedProduct;
      fetch(`/api/edit_product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_name: name, price, category }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Product updated:", data);
          this.fetchProducts();
          this.closeEditProductModal();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    openCreateProductModal() {
      this.createProductModalOpen = true;
    },
    closeCreateProductModal() {
      this.createProductModalOpen = false;
    },
  },
};
