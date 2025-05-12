<template>
  <nav
    class="navbar navbar-expand-lg navbar-absolute"
    :class="{ 'bg-white': showMenu, 'navbar-transparent': !showMenu }"
  >
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div
          class="navbar-toggle d-inline"
          :class="{ toggled: $sidebar.showSidebar }"
        >
          <button type="button" class="navbar-toggler" @click="toggleSidebar">
            <span class="navbar-toggler-bar bar1"></span>

            <span class="navbar-toggler-bar bar2"></span>

            <span class="navbar-toggler-bar bar3"></span>
          </button>
        </div>

        <a class="navbar-brand" href="javascript:void(0)"> FITBOT</a>
      </div>

      <button
        class="navbar-toggler"
        type="button"
        @click="toggleMenu"
        data-toggle="collapse"
        data-target="#navigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-bar navbar-kebab"></span>

        <span class="navbar-toggler-bar navbar-kebab"></span>

        <span class="navbar-toggler-bar navbar-kebab"></span>
      </button>

      <div class="collapse navbar-collapse show text-left" v-show="showMenu">
        <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
          <li class="search-bar input-group" @click="searchModalVisible = true">
            <button
              class="btn btn-link"
              id="search-button"
              data-toggle="modal"
              data-target="#searchModal"
            >
              <i class="tim-icons icon-zoom-split"></i>

              <span class="d-lg-none d-md-block">Search</span>
            </button>
          </li>

          <modal
            :show.sync="searchModalVisible"
            class="modal-search"
            id="searchModal"
            :centered="false"
            :show-close="true"
          >
            <input
              slot="header"
              v-model="searchQuery"
              type="text"
              class="form-control"
              id="inlineFormInputGroup"
              placeholder="SEARCH"
            />
          </modal>

          <drop-down>
            <a href="#" class="dropdown-toggle nav-link" data-toggle="dropdown">
              <div class="photo">
                <img
                  v-if="isLogin"
                  src="@/assets/img/anime3.png"
                  alt="Profile Photo"
                />
                <img v-else src="@/assets/img/user.png" alt="Profile Photo" />
              </div>

              <b class="caret d-none d-lg-block d-xl-block"></b>

              <p class="d-lg-none">Log</p>
            </a>

            <ul class="dropdown-menu dropdown-navbar">
              <li class="nav-link">
                <el-button
                  v-if="isLogin"
                  @click="userLogout"
                  class="nav-item dropdown-item"
                >
                  退出登录
                </el-button>
                <a
                  style="cursor: pointer"
                  v-if="!isLogin"
                  class="nav-item dropdown-item"
                  @click="centerDialogVisible = true"
                >
                  登录
                </a>
                <a
                  style="cursor: pointer"
                  v-if="!isLogin"
                  class="nav-item dropdown-item"
                  @click="
                    centerDialogVisible2 = true;
                    noCode = true;
                  "
                >
                  注册
                </a>
              </li>
            </ul>
          </drop-down>
        </ul>
      </div>
    </div>

    <el-dialog
      append-to-body
      title="登录"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <el-input v-model="email" placeholder="请输入邮箱"></el-input>
      <el-input
        style="margin-top: 2vh"
        v-model="password"
        placeholder="请输入密码"
        show-password
      ></el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="userLogin">登录</el-button>
      </span>
    </el-dialog>

    <el-dialog
      append-to-body
      title="注册"
      :visible.sync="centerDialogVisible2"
      width="30%"
      center
    >
      <el-input v-model="email" placeholder="请输入邮箱"></el-input>
      <el-input
        style="margin-top: 2vh"
        v-model="password"
        placeholder="请输入密码"
        show-password
      ></el-input>
      <el-input
        style="margin-top: 2vh"
        v-model="repassword"
        placeholder="请再次输入密码"
        show-password
      ></el-input>
      <el-input
        style="margin-top: 2vh"
        v-model="code"
        placeholder="请输入验证码"
      >
        <el-button slot="append" @click="sendMsg" :disabled="isSend">
          {{ code_msg }}</el-button
        >
      </el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="userSignup" :disabled="noCode"
          >注册</el-button
        >
      </span>
    </el-dialog>
  </nav>
</template>

<script>
import DropDown from "@/components/Dropdown.vue";
import Modal from "@/components/Modal.vue";
import axios from "axios";
import { EventBus } from "../../../event-bus.js";
export default {
  components: {
    DropDown,
    Modal,
  },
  data() {
    return {
      searchModalVisible: false,
      searchQuery: "",
      showMenu: false,
      centerDialogVisible: false,
      centerDialogVisible2: false,
      isLogin: false,
      email: "",
      password: "",
      repassword: "",
      code: "",
      noCode: true,
      emailError: "",
      isSend: false,
      code_msg: "点击获取验证码",
      last_time: 58,
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = "邮箱不能为空";
      } else {
        if (!emailPattern.test(this.email)) {
          this.emailError = "请输入有效的邮箱地址";
        } else {
          this.emailError = "";
        }
      }
    },
    sendMsg() {
      this.validateEmail();
      if (this.emailError) {
        this.$message({
          message: this.emailError,
          type: "warning",
        });
        return;
      }
      if (this.password !== this.repassword) {
        this.$message({
          message: "两次密码输入不一致",
          type: "warning",
        });
        return;
      }
      if (!this.password || !this.repassword) {
        this.$message({
          message: "请输入密码",
          type: "warning",
        });
        return;
      }
      this.noCode = false;
      this.code_msg = "59秒后再次发送";
      this.isSend = true;
      let time_it = setInterval(() => {
        this.code_msg = this.last_time-- + "秒后再次发送";
      }, 1000);
      setTimeout(() => {
        clearInterval(time_it);
        this.code_msg = "点击获取验证码";
      }, 60000);
      setTimeout(() => {
        this.isSend = false;
        this.code_msg = "点击获取验证码";
      }, 60000);
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/sendMail.php",
          {
            email: this.email,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          if (response.data === 1) {
            this.$message({
              message: "已经向您的邮箱发送了一封邮件",
              type: "success",
            });
          }
        });
    },
    userSignup() {
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/signup.php",
          {
            email: this.email,
            pwd: this.password,
            code: this.code,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          if (response.data === "wc") {
            this.$message.error("验证码错误！");
          } else if (response.data === 1) {
            this.$message.error("该邮箱已被注册");
          } else if (response.data === 0) {
            this.centerDialogVisible2 = false;
            this.$message({
              message: "注册成功",
              type: "success",
            });
          } else {
            this.$message({
              message: "出错了，再试一次",
              type: "warning",
            });
          }
        });
    },
    userLogin() {
      this.centerDialogVisible = false;
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/signin.php",
          {
            email: this.email,
            pwd: this.password,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          // 成功时，显示响应数据
          if (response.data === 1) {
            this.isLogin = true;
            sessionStorage.setItem("email", this.email);
            EventBus.$emit("login_success", "Hello from Component A");
            axios
              .post(
                "https://www.lloydyide.cn/fitbotAPI/getUserInf.php",
                {
                  email: this.email,
                },
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              )
              .then((response) => {
                console.log(response.data[0]);
                sessionStorage.setItem("name", response.data[0].name);
                sessionStorage.setItem("address", response.data[0].address);
                sessionStorage.setItem("gender", response.data[0].gender);
                this.$message({
                  message: response.data[0].name + ",欢迎您！",
                  type: "success",
                  center: true,
                });
                axios
                  .post(
                    "https://www.lloydyide.cn/fitbotAPI/getUserBInf.php",
                    {
                      email: this.email,
                    },
                    {
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                    }
                  )
                  .then((response) => {
                    console.log(response.data[0]);
                    sessionStorage.setItem(
                      "fat_percentage",
                      response.data[0].fat_percentage
                    );
                    sessionStorage.setItem("height", response.data[0].height);
                    sessionStorage.setItem(
                      "metabolism",
                      response.data[0].metabolism
                    );
                    sessionStorage.setItem("time", response.data[0].time);
                    sessionStorage.setItem("weight", response.data[0].weight);
                    sessionStorage.setItem(
                      "introduce",
                      response.data[0].introduce
                    );
                    EventBus.$emit("session_ready", "Hello from Component A");
                  });
              });
          } else {
            this.$message.error("邮箱或密码错误");
          }
        })
        .catch((error) => {
          // 错误处理
          console.error("There was an error!", error);
        });
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    userLogout() {
      sessionStorage.clear();
      this.isLogin = false;
      this.$message({
        message: "您已退出登录！",
        type: "success",
        center: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  },
  mounted() {
    if (sessionStorage.getItem("name")) {
      this.isLogin = true;
    }
  },
};
</script>

<style></style>
