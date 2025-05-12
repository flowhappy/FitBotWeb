<template>
  <!-- 1. 容器 -->
  <div ref="chart" style="width: 35vw; height: 40vh"></div>
</template>

<script>
import * as echarts from "echarts";
import axios from "axios";

export default {
  name: "echarts", // 建议给组件一个更具体的名称
  data() {
    return {
      // user_data: [], // 可以移除，直接在 setOption 时使用获取到的数据
      chartInstance: null, // 用于存储 ECharts 实例
      isLoading: false, // (可选) 添加加载状态
      error: null, // (可选) 添加错误状态
    };
  },
  mounted() {
    // 2. 先初始化图表基本结构
    this.initChart();
    // 3. 然后获取数据并更新图表
    this.fetchAndUpdateChart();
    // 4. (推荐) 添加窗口大小调整监听
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    // 5. (推荐) 组件销毁前销毁 ECharts 实例并移除监听
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    // 初始化图表方法
    initChart() {
      const chartDom = this.$refs.chart;
      if (chartDom && !this.chartInstance) {
        // 确保 DOM 存在且实例未初始化
        this.chartInstance = echarts.init(chartDom);

        // 定义初始的、不含具体数据的配置项
        const initialOption = {
          title: {
            text: "用户运动准确率", // 可以设置一个更合适的标题
          },
          tooltip: {
            trigger: "axis", // 坐标轴触发提示框
          },
          xAxis: {
            data: [
              // X 轴标签保持不变
              "JAN",
              "FEB",
              "MAR",
              "APR",
              "MAY",
              "JUN",
              "JUL",
              "AUG",
              "SEP",
              "OCT",
              "NOV",
              "DEC",
            ],
            splitLine: {
              show: true, // 确认显示 Y 轴网格线 (水平线)
            },
          },
          yAxis: {
            min: 0, // 根据你的数据（准确率）设置合理的范围
            max: 15,
            type: "value",
            axisLabel: {
              color: "#000000", // 设置 y 轴标签文字颜色为白色
            },
            splitLine: {
              show: true, // 确认显示 Y 轴网格线 (水平线)
            },
            axisLine: {
              show: true, // 显示Y轴线
              lineStyle: {
                color: "#000000", // 设置 y 轴线颜色为白色
              },
            },
          },
          series: [
            {
              name: "准确率", // 系列名称
              type: "bar", // 柱状图
              data: [], // 初始数据为空，等待加载
              itemStyle: {
                // 可以设置柱状图颜色等
                color: "#4e73df", // 例如，设置一个蓝色
              },
            },
          ],
          grid: {
            // 调整图表在容器内的边距
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true, // 防止标签溢出
          },
        };

        // 使用初始配置项渲染图表框架
        this.chartInstance.setOption(initialOption);
      } else if (!chartDom) {
        console.error("图表容器 'chart' 未找到!");
      }
    },

    // 获取数据并更新图表的方法
    fetchAndUpdateChart() {
      if (this.isLoading) return; // 防止重复请求
      this.isLoading = true;
      this.error = null;

      const userEmail = sessionStorage.getItem("email");
      if (!userEmail) {
        console.error("无法从 sessionStorage 获取 email");
        this.error = "未找到用户信息";
        this.isLoading = false;
        // 可以选择在这里清空图表或显示提示
        // if(this.chartInstance) this.chartInstance.setOption({ series: [{data: []}] });
        return; // 终止执行
      }

      axios
        .post(
          "https://www.lloydyide.cn/fitbotAPI/getUserMInf.php",
          { email: userEmail },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          console.log("Response:", response.data); // 打印整个返回数据以便调试
          if (response.data && response.data.length > 0) {
            const res_data = response.data[0];

            // 提取 accuracy 数据 - 确保顺序正确或 API 返回有序
            // 如果 API 不能保证 accuracy_1, accuracy_2... 的顺序，需要排序
            const accuracyValues = Object.keys(res_data)
              // 匹配 accuracy_ 开头，后跟数字的键
              .filter((key) => /^accuracy_\d+$/.test(key))
              // (可选) 如果需要按数字排序
              .sort((a, b) => {
                const numA = parseInt(a.split("_")[1], 10);
                const numB = parseInt(b.split("_")[1], 10);
                return numA - numB;
              })
              // 提取对应的值，并确保是数字类型
              .map((key) => parseFloat(res_data[key]) || 0); // 使用 parseFloat 并提供默认值 0

            console.log("提取到的 Accuracy 数据:", accuracyValues);

            // 确保我们有 ECharts 实例
            if (this.chartInstance) {
              // 更新图表数据
              this.chartInstance.setOption({
                series: [
                  {
                    // 这里只需要提供要更新的数据部分
                    data: accuracyValues,
                  },
                ],
                // (可选) 如果标题也需要根据数据更新
                // title: {
                //   text: `${userEmail} 的月度准确率`
                // }
              });
              console.log("图表数据已更新");
            }
          } else {
            console.error("API 返回数据为空或格式不正确:", response.data);
            this.error = "未能从服务器获取有效数据";
            // (可选) 清空图表
            // if(this.chartInstance) this.chartInstance.setOption({ series: [{data: []}] });
          }
        })
        .catch((error) => {
          console.error("请求错误:", error);
          this.error = "加载数据失败，请稍后重试";
          // (可选) 清空图表
          // if(this.chartInstance) this.chartInstance.setOption({ series: [{data: []}] });
        })
        .finally(() => {
          this.isLoading = false; // 无论成功失败，结束加载状态
        });
    },

    // 处理窗口大小变化，调整图表
    handleResize() {
      if (this.chartInstance) {
        // 添加一个小的延迟，等待容器尺寸稳定后再调整
        // 因为 resize 事件可能触发非常频繁
        setTimeout(() => {
          if (this.chartInstance) {
            // 再次检查实例是否存在
            this.chartInstance.resize();
          }
        }, 200); // 200ms 延迟
      }
    },
  },
};
</script>

<style scoped>
.error-message {
  color: red;
}
</style>
