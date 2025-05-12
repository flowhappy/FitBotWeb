<template>
  <div class="content">
    <div class="row">
      <div class="col-md-8">
        <edit-profile-form> </edit-profile-form>
      </div>
      <div class="col-md-4">
        <user-card :user="user"></user-card>
      </div>
    </div>
  </div>
</template>
<script>
import EditProfileForm from "./Profile/EditProfileForm.vue";
import UserCard from "./Profile/UserCard.vue";
import { EventBus } from "../../event-bus.js";

export default {
  components: {
    EditProfileForm,
    UserCard,
  },
  data() {
    return {
      user: {
        fullName: "UserName",
        title: "User",
        description: `I LOVE FITBOT! I LOVE FITBOT! I LOVE FITBOT! I LOVE FITBOT! I LOVE FITBOT! I LOVE FITBOT! I LOVE FITBOT! `,
      },
    };
  },
  mounted() {
    if (sessionStorage.getItem("name")) {
      this.user.fullName = sessionStorage.getItem("name");
    }
    EventBus.$on("session_ready", () => {
      this.user.fullName = sessionStorage.getItem("name");
    });
  },
};
</script>
<style></style>
