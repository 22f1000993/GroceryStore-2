import CustomerDashboard from "./CustomerDashboard.js";
import ManagerHome from "./ManagerHome.js";
import AdminDashboard from "./AdminDashboard.js";
import registeration from "./registeration.js";

export default {
  template: `<div>
  <CustomerDashboard v-if="userRole=='customer'"/>
  <AdminDashboard v-if="userRole=='admin'" />
  <ManagerHome v-if="userRole=='manager'" />
  </div>`,

  data() {
    return {
      userRole: localStorage.getItem("role") || "customer",
      authToken: localStorage.getItem("auth-token"),
      resources: [],
    };
  },

  components: {
    CustomerDashboard,
    AdminDashboard,
    ManagerHome,
    registeration,
  },
  async mounted() {
    const res = await fetch("/api/products", {
      headers: {
        "Authentication-Token": this.authToken,
      },
    });
    const data = await res.json();
    if (res.ok) {
      this.resources = data;
    } else {
      alert(data.message);
    }
  },
};
