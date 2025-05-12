<template>
  <div class="content">
    <div class="row">
      <div class="col-12">
        <card style="height: 86vh; overflow: scroll">
          <template slot="header">
            <h4 class="card-title">文章列表</h4>
          </template>
          <div class="table-responsive text-left">
            <base-table
              :data="table1.data"
              :columns="table1.columns"
              thead-classes="text-primary"
              @row-click="handleRowClick"
            >
            </base-table>
          </div>
        </card>
      </div>

      <el-drawer
        :withHeader="false"
        :visible.sync="drawer"
        direction="ttb"
        size="100%"
        :append-to-body="true"
        custom-class="article-detail-drawer"
      >
        <!-- 确保 selectedArticle 有数据后再渲染内部结构 -->
        <div v-if="selectedArticle" class="drawer-layout">
          <!-- 关闭按钮 -->
          <el-button
            type="info"
            icon="el-icon-close"
            circle
            class="close-button"
            @click="drawer = false"
          ></el-button>
          <div class="image-pane">
            <el-carousel
              :interval="5000"
              arrow="always"
              height="100%"
              class="image-carousel"
              ref="imageCarousel"
            >
              <el-carousel-item
                v-for="(imgUrl, index) in selectedArticle.imageUrls"
                :key="index"
              >
                <!-- 让图片填充轮播项，并保持比例 -->
                <img
                  :src="imgUrl.pic_url"
                  :alt="'文章图片 ' + imgUrl"
                  class="carousel-image"
                />
              </el-carousel-item>
            </el-carousel>
          </div>

          <!-- 右侧内容和评论区域 -->
          <div class="details-pane">
            <!-- 上部：内容 -->
            <div class="content-section">
              <h3 style="font-weight: bolder">{{ selectedArticle.title }}</h3>
              <div class="content-text-area">
                {{ selectedArticle.content }}
              </div>
            </div>

            <!-- 下部：评论 -->
            <div class="comments-section">
              <h5 style="color: black">
                共{{ selectedArticle.commit_num }}条评论：
              </h5>

              <div>
                <el-input
                  placeholder="说点什么..."
                  v-model="user_comment"
                  class="input-with-select"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-s-promotion"
                    @click="judgeComment"
                    >发送</el-button
                  >
                </el-input>
              </div>

              <div class="comments-list-area">
                <!-- 替换 selectedArticle.comments 为你的实际评论数组属性 -->
                <ul
                  v-if="Array.isArray(commitInf) && commitInf.length > 0"
                  class="comment-list"
                >
                  <li
                    v-for="(comment, index) in commitInf"
                    :key="index"
                    class="comment-item"
                  >
                    <!-- 左侧内容区 (占位较多) -->
                    <div class="comment-left">
                      <div class="comment-user">
                        {{ comment.user_name || "匿名用户" }}
                      </div>
                      <div class="comment-content">
                        {{ comment.content }}
                      </div>
                      <div class="comment-meta">
                        <span class="comment-date">{{ comment.date }}</span>
                        <span v-if="comment.location" class="comment-location">
                          · {{ comment.location }}</span
                        >
                        <span
                          style="
                            margin-left: 1vw;
                            color: #ff6b6b;
                            cursor: pointer;
                          "
                          v-if="comment.is_own"
                          @click="delete_comment(comment.id)"
                          >删除</span
                        >
                      </div>
                    </div>

                    <!-- 右侧点赞区 (占位较少) -->
                    <div class="comment-right">
                      <span class="comment-star">
                        <i
                          class="el-icon-star-on"
                          style="color: #ffc107; font-size: 2rem"
                          @click="
                            likeComment(
                              commitInf[index].id,
                              commitInf[index].star
                            )
                          "
                        ></i>
                        {{ comment.star }}
                      </span>
                    </div>
                  </li>
                </ul>
                <p v-else class="no-comments">暂无评论</p>
              </div>
            </div>

            <!-- 建议将以下 CSS 添加到你的 <style> 标签或 CSS 文件中 -->
          </div>
        </div>

        <!-- selectedArticle 为空时的占位提示 -->
        <div v-else class="drawer-placeholder">
          <p>请先在表格中选择一篇文章以查看详情。</p>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import { Card } from "@/components/index";
import BaseTable from "@/components/BaseTable";
import axios from "axios";

export default {
  name: "YourComponentName",
  components: {
    Card,
    BaseTable,
    // ElDrawer: Drawer,
  },
  data() {
    return {
      own_comment: false,
      user_comment: "",
      commitInf: [],
      drawer: false,
      selectedArticle: null,
      table1: {
        title: "简单表格",
        columns: ["title", "intro", "commit_num"],
        data: [],
      },
    };
  },
  beforeMount() {
    this.fetchTable1Data();
  },
  methods: {
    delete_comment(comment_id) {
      this.$confirm("", "此操作将永久删除该评论, 是否继续?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          axios
            .post(
              "https://www.lloydyide.cn/fitbotAPI/deleteChat.php",
              {
                chat_id: comment_id,
                article_id: this.selectedArticle.id,
                commit_num: Number(this.selectedArticle.commit_num) - 1,
              },
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            )
            .then((response) => {
              console.log("delete success", response);
              this.commitInf = this.commitInf.filter(
                (item) => item.id !== comment_id
              );
              this.selectedArticle.commit_num =
                Number(this.selectedArticle.commit_num) - 1;
            })
            .catch((error) => {
              console.error("获取数据时出错:", error);
            });
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
      console.log(comment_id);
    },
    likeComment(id, star) {
      console.log(id); //评论id
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/likeCommit.php",
          {
            email: sessionStorage.getItem("email"),
            id,
            star,
          },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          console.log(response.data);
          this.getChat(this.selectedArticle.id);
          if (response.data === 0) {
            this.$message.success("点赞成功");
          } else {
            this.$message.success("取消点赞成功");
          }
        });
    },
    sendComment() {
      // 判断评论是否有暴力危险嫌疑，通过后上传
      axios
        .post("http://172.20.10.4:5001/predict", {
          text: this.user_comment,
        })
        .then((response) => {
          console.log(response.data.result); //prediction
          if (response.data.prediction === 1) {
            this.$message.error("评论检测为有害！");
          } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            const currentDate = `${year}-${month}-${day}`;
            axios
              .post(
                "https://www.lloydyide.cn/fitbotAPI/uploadChat.php",
                {
                  article_id: this.selectedArticle.id,
                  content: this.user_comment,
                  user_id: sessionStorage.getItem("email"),
                  date: currentDate,
                  location: "上海",
                  user_name: sessionStorage.getItem("name"),
                  commit_num: Number(this.selectedArticle.commit_num) + 1,
                },
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              )
              .then((response) => {
                console.log(response.data);
                this.user_comment = "";
                this.getChat(this.selectedArticle.id);
                this.selectedArticle.commit_num =
                  Number(this.selectedArticle.commit_num) + 1;
              })
              .catch((error) => {
                console.error("获取数据时出错:", error);
              });
          }
        })
        .catch((error) => {
          console.error("请求失败:", error);
        });
    },
    judgeComment() {
      if (!sessionStorage.getItem("name")) {
        this.$message.error("请先登陆");
      } else if (!this.user_comment.length) {
        this.$message.error("请先说些什么");
      } else {
        this.sendComment();
      }

      // 根据IP获取城市 太慢
      // axios
      //   .post(
      //     "http://ip-api.com/json/124.79.86.8",
      //     {},
      //     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      //   )
      //   .then((response) => {
      //     console.log(response.data.regionName);
      //   })
      //   .catch((error) => {
      //     console.error("获取数据时出错:", error);
      //   });
    },
    fetchTable1Data() {
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/getArticleInf.php",
          {},
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          if (Array.isArray(response.data)) {
            this.table1.data = response.data;
          } else {
            console.error("API 返回的不是数组:", response.data);
            this.table1.data = [];
          }
        })
        .catch((error) => {
          console.error("获取表格数据时出错:", error);
          this.table1.data = [];
        });
    },
    getChat(id) {
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/getChat.php",
          {
            id,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          this.commitInf = [...response.data].sort((a, b) => b.id - a.id);
          this.commitInf.forEach((item) => {
            const isOwn = item.user_id === sessionStorage.getItem("email");
            this.$set(item, "is_own", isOwn);
          });
        })
        .catch((error) => {
          console.error("获取数据时出错:", error);
        });
    },
    // 在父组件的 <script> methods 中
    handleRowClick(item) {
      console.log("点击的行数据:", item); // <--- 添加这行来查看数据
      this.selectedArticle = item;
      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/getArticlePic.php",
          {
            id: item.id,
          },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          this.selectedArticle.imageUrls = response.data;
          console.log(this.selectedArticle.imageUrls[0].pic_url);
          this.getChat(item.id);
        })
        .catch((error) => {
          console.error("获取数据时出错:", error);
        });
      this.drawer = true;
    },
  },
};
</script>

<style>
/* 为抽屉添加一个自定义类，方便进行样式覆盖和限定范围 */
:deep {
  padding: 0; /* 移除 Element UI 默认的 body padding */
  overflow: hidden; /* 防止内部元素溢出导致滚动条出现问题 */
  height: 100%;
  display: flex; /* 使用 flex 布局 */
}

.drawer-layout {
  position: relative; /* 父容器需要相对定位，以便绝对定位的子元素相对于它定位 */
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
}

.close-button {
  position: absolute; /* 使用绝对定位 */
  top: 20px; /* 距离顶部 20px */
  left: 20px; /* 距离左侧 20px */
  z-index: 10; /* 确保按钮在其他内容之上 */
}
/* 左侧图片面板 */
.image-pane {
  flex: 0 0 50%; /* 保持原有的宽度设置 */
  padding: 4.5vw; /* 可以适当减少内边距，给轮播图更多空间 */
  box-sizing: border-box;
  display: flex; /* 仍然使用flex来居中占位符 */
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 防止轮播图溢出 */
  border-right: 1px solid #dee2e6;
  position: relative; /* 添加相对定位，如果需要绝对定位内部元素 */
}

.image-carousel {
  width: 100%; /* 轮播图宽度占满 image-pane */
  height: 100%; /* 轮播图高度占满 image-pane */
}

/* 设置轮播图中图片本身的样式 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* 消除图片下方的微小间隙 */
  border-radius: 6px; /* 给图片加点圆角 */
}
/* 调整箭头按钮 */
:deep(.image-carousel) {
  background-color: rgba(31, 45, 61, 0.7); /* 半透明背景 */
  width: 40px;
  height: 40px;
  font-size: 18px;
}
:deep(.image-carousel) {
  left: 15px; /* 调整左箭头位置 */
}
:deep(.image-carousel) {
  right: 15px; /* 调整右箭头位置 */
}
/* 调整指示器 */
:deep(.image-carousel) {
  bottom: 10px; /* 指示器距离底部距离 */
}
:deep(.image-carousel .el-carousel__indicator button) {
  background-color: #ced4da; /* 指示器非激活颜色 */
  opacity: 0.8;
  width: 10px; /* 可以调小一点 */
  height: 10px;
  border-radius: 50%;
}
:deep(.image-carousel .el-carousel__indicator.is-active button) {
  background-color: #007bff; /* 指示器激活颜色 */
  opacity: 1;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd; /* 占位文字颜色 */
  background-color: #e9ecef; /* 占位背景色 */
  border-radius: 8px;
  font-size: 1.2em;
}

/* 右侧详情面板 */
.details-pane {
  flex: 0 0 50%; /* 固定宽度为50% */
  display: flex;
  flex-direction: column; /* 垂直排列：上内容下评论 */
  height: 100%;
  overflow: hidden; /* 防止内部滚动影响外部 */
}

/* 内容区域 */
.content-section {
  /* flex-grow: 1; 让内容区尽可能填充空间，但要考虑最小高度 */
  padding: 25px; /* 增加内边距 */
  box-sizing: border-box;
  overflow-y: auto; /* 内容过多时允许滚动 */
  flex-shrink: 0; /* 防止被评论区过度压缩 */
  border-bottom: 1px solid #dee2e6; /* 底部边框分割线 */
  background-color: #ffffff; /* 内容区白色背景 */
}

.content-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #343a40;
  font-size: 1.4em;
}

.content-text-area {
  line-height: 1.6;
  color: #495057;
}

/* 评论区域 */
.comments-section {
  flex-grow: 1; /* 占据剩余空间 */
  padding: 25px;
  box-sizing: border-box;
  overflow-y: auto; /* 评论过多时允许滚动 */
  display: flex; /* 使用flex布局方便控制内部滚动 */
  flex-direction: column; /* 垂直排列标题和列表 */
}

.comments-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* --- 单条评论样式 --- */
.comment-item {
  display: flex; /* 启用 Flexbox 布局 */
  justify-content: space-between; /* 两侧内容分开 */
  padding: 15px 0; /* 上下内边距 */
  border-bottom: 1px dashed #e0e0e0; /* 评论之间的分隔线 */
}

.comment-item:last-child {
  border-bottom: none; /* 最后一条评论不需要分隔线 */
}

/* --- 评论左侧 --- */
.comment-left {
  flex: 1; /* 占据剩余空间 (大致 80% 效果) */
  padding-right: 15px; /* 与右侧点赞区隔开 */
  display: flex;
  flex-direction: column; /* 内部元素垂直排列 */
}

.comment-user {
  font-weight: bold;
  color: #007bff; /* 用户名颜色 */
  margin-bottom: 5px;
  font-size: 0.95em;
}

.comment-content {
  color: #444; /* 评论内容颜色 */
  line-height: 1.6;
  margin-bottom: 8px;
  word-wrap: break-word; /* 长单词或链接换行 */
}

.comment-meta {
  font-size: 0.8em; /* 元信息字体小一点 */
  color: #888; /* 元信息颜色浅一点 */
}

.comment-date {
  margin-right: 5px;
}

.comment-location {
  /* 可选：给地点加个小图标 */
  /* content: "\f3c5";  -- FontAwesome 示例 */
  /* font-family: "Font Awesome 5 Free"; */
  /* font-weight: 900; */
  /* margin-right: 3px; */
}

/* --- 评论右侧 --- */
.comment-right {
  flex: 0 0 60px; /* 固定宽度 (大致 20% 效果，可调整)，不伸缩 */
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  text-align: center;
}

.comment-star {
  display: flex;
  flex-direction: column; /* 图标和数字垂直排列 */
  align-items: center;
  color: #666;
  font-size: 0.9em;
}

/* --- 无评论提示 --- */
.no-comments {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.no-comments {
  color: #6c757d;
  font-style: italic;
}

/* selectedArticle 为空时的占位符样式 */
.drawer-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.1em;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}
</style>
