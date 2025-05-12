<template>
  <card>
    <template slot="header">
      <h5 class="title">Edit Profile</h5>
    </template>
    <div class="row">
      <div class="col-md-5 pr-md-1 text-left">
        <base-input
          label="Email"
          placeholder="example@example.com"
          v-model="user_email"
          disabled
        >
        </base-input>
      </div>
      <div class="col-md-3 px-md-1 text-left">
        <base-input label="Username" placeholder="Username" v-model="user_name">
        </base-input>
      </div>
      <div class="col-md-4 pl-md-1 text-left">
        <base-input
          label="Gender"
          placeholder="male"
          v-model="user_gender"
          disabled
        >
        </base-input>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 text-left">
        <base-input
          label="Address"
          v-model="user_address"
          placeholder="Home Address"
        >
        </base-input>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 pr-md-1 text-left">
        <base-input
          label="Weight"
          v-model="user_weight"
          placeholder="your weight"
        >
        </base-input>
      </div>
      <div class="col-md-4 px-md-1 text-left">
        <base-input
          label="Height"
          v-model="user_height"
          placeholder="your height"
        >
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 pr-md-1 text-left">
        <base-input
          label="Fat Percentage"
          v-model="user_fat_percentage"
          disabled
        >
        </base-input>
      </div>
      <div class="col-md-4 px-md-1 text-left">
        <base-input
          label="Metabolism"
          v-model="user_metabolism"
          placeholder="your metabolism"
        >
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8 text-left">
        <base-input>
          <label>About Me</label>
          <textarea
            rows="4"
            cols="80"
            class="form-control"
            placeholder="Here can be your description"
            v-model="user_about"
          >
          </textarea>
        </base-input>
      </div>
    </div>
    <template slot="footer">
      <base-button type="success" fill @click="update_info">Save</base-button>
    </template>
  </card>
</template>
<script>
import { Card, BaseInput } from "@/components/index";
import BaseButton from "@/components/BaseButton";
import { EventBus } from "../../../event-bus.js";
import axios from "axios";
export default {
  components: {
    Card,
    BaseInput,
    BaseButton,
  },
  props: {
    model: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      user_email: "",
      user_name: "",
      user_gender: "",
      user_weight: "",
      user_metabolism: "",
      user_about: "",
      user_height: "",
      user_address: "",
    };
  },
  mounted() {
    let user_name = sessionStorage.getItem("name");
    if (!user_name) {
      this.$message.error("请先登录");
      EventBus.$on("session_ready", () => {
        this.user_email = sessionStorage.getItem("email");
        this.user_name = sessionStorage.getItem("name");
        this.user_gender = sessionStorage.getItem("gender") ? "male" : "female";
        this.user_metabolism = sessionStorage.getItem("metabolism");
        this.user_about = sessionStorage.getItem("introduce");
        this.user_weight = sessionStorage.getItem("weight");
        this.user_height = sessionStorage.getItem("height");
        this.user_address = sessionStorage.getItem("address");
        this.user_fat_percentage =
          (Number(this.user_weight) /
            Number(this.user_height) /
            Number(this.user_height)) *
          10000;
      });
    } else {
      this.user_email = sessionStorage.getItem("email");
      this.user_name = sessionStorage.getItem("name");
      this.user_gender = sessionStorage.getItem("gender") ? "male" : "female";
      this.user_metabolism = sessionStorage.getItem("metabolism");
      this.user_about = sessionStorage.getItem("introduce");
      this.user_weight = sessionStorage.getItem("weight");
      this.user_height = sessionStorage.getItem("height");
      this.user_address = sessionStorage.getItem("address");
      this.user_fat_percentage =
        (Number(this.user_weight) /
          Number(this.user_height) /
          Number(this.user_height)) *
        10000;
    }
  },
  computed: {
    user_fat_percentage: {
      get() {
        return (
          (Number(this.user_weight) /
            Number(this.user_height) /
            Number(this.user_height)) *
          10000
        ).toFixed(1);
      },

      set() {
        return (
          (Number(this.user_weight) /
            Number(this.user_height) /
            Number(this.user_height)) *
          10000
        ).toFixed(1);
      },
    },
  },
  methods: {
    update_info() {
      if (!sessionStorage.getItem("email")) {
        this.$message.error("请先登录");
      }
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/updateUserInf.php",
          {
            email: this.user_email,
            name: this.user_name,
            weight: this.user_weight,
            height: this.user_height,
            address: this.user_address,
            introduce: this.user_about,
            metabolism: this.user_metabolism,
            fat_percentage: this.user_fat_percentage,
            month: new Date().getMonth() + 1,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            sessionStorage.setItem("name", this.user_name);
            sessionStorage.setItem("metabolism", this.user_metabolism);
            sessionStorage.setItem("introduce", this.user_about);
            sessionStorage.setItem("weight", this.user_weight);
            sessionStorage.setItem("height", this.user_height);
            sessionStorage.setItem("address", this.user_address);
            axios
              .post(
                "https://www.lloydyide.cn/fitbotAPI/getUserMInf.php",
                {
                  email: sessionStorage.getItem("email"),
                },
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              )
              .then((response) => {
                console.log("Response:", response.data[0]); // 请求成功时的处理
                const res_data = response.data[0];
                let user_monthly_info = [];
                const weightValues = Object.keys(res_data)
                  .filter((key) => /^weight_\d+$/.test(key)) // 过滤出以 weight_ 开头的字段
                  .map((key) => res_data[key]); // 提取对应的值
                user_monthly_info.push(weightValues);

                const accuracyValues = Object.keys(res_data)
                  .filter((key) => /^accuracy_\d+$/.test(key)) // 过滤出以 weight_ 开头的字段
                  .map((key) => res_data[key]); // 提取对应的值
                user_monthly_info.push(accuracyValues);

                const fat_percentageValues = Object.keys(res_data)
                  .filter((key) => /^fat_percentage_\d+$/.test(key)) // 过滤出以 weight_ 开头的字段
                  .map((key) => res_data[key]); // 提取对应的值
                user_monthly_info.push(fat_percentageValues);

                const timeValues = Object.keys(res_data)
                  .filter((key) => /^time_\d+$/.test(key)) // 过滤出以 weight_ 开头的字段
                  .map((key) => res_data[key]); // 提取对应的值
                user_monthly_info.push(timeValues);
                sessionStorage.setItem("umf", user_monthly_info);
                this.$message.success("更新成功");
              })
              .catch((error) => {
                console.error("Error:", error); // 请求失败时的处理
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
<style></style>
