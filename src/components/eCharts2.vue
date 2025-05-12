<template>
  <div>
    <div
      ref="chart"
      style="width: 35vw; height: 40vh"
    ></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import axios from "axios";

// 提前定义好月份名称，用于饼图的 name
const MONTH_NAMES = [
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
];

export default {
  name: "echarts2", // 改个名表示是饼图
  data() {
    return {
      chartInstance: null,
      isLoading: false,
      error: null,
      boundResizeHandler: null,
    };
  },
  mounted() {
    this.initChart();
    this.fetchAndUpdateChart();
    this.boundResizeHandler = this.handleResize.bind(this);
    window.addEventListener("resize", this.boundResizeHandler);
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    if (this.boundResizeHandler) {
      window.removeEventListener("resize", this.boundResizeHandler);
    }
  },
  methods: {
    // 初始化图表方法 - 饼图配置
    initChart() {
      const chartDom = this.$refs.chart;
      if (chartDom && !this.chartInstance) {
        this.chartInstance = echarts.init(chartDom);

        // --- 饼图的初始配置 ---
        const initialOption = {

          title: {
            text: "用户月度训练时长分布", // 修改标题
            left: "center", // 标题居中
            textStyle: { color: "#000000" }, // 假设标题为白色
          },
          tooltip: {
            trigger: "item", // 饼图通常用 item 触发
            formatter: "{a} <br/>{b} : {c} ({d}%)", // a: 系列名, b: 数据名, c: 数值, d: 百分比
          },
          legend: {
            // 添加图例组件
            show: false,
            orient: "vertical", // 垂直布局
            left: "left", // 放在左边
            top: "middle", // 垂直居中
            data: MONTH_NAMES, // 图例数据，即月份名称
            textStyle: { color: "#000000" }, // 假设图例文字为白色
          },
          series: [
            {
              name: "训练时长", // 系列名称，对应 tooltip 的 {a}
              type: "pie", // *** 类型改为 pie ***
              radius: ["40%", "70%"],
              center: ["50%", "50%"], // 将饼图调整到容器中心
              data: [], // 初始数据为空
              emphasis: {
                // 鼠标悬浮时的样式
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              label: {
                // 饼图图形上的文本标签
                // show: false, // 可以选择不显示标签
                formatter: "{b}: {d}%", // 显示名称和百分比
                color: "#000000", // 假设标签文字为白色
              },
              labelLine: {
                // 标签引导线样式
                smooth: 0.2,
                length: 10,
                length2: 20,
              },
              itemStyle: {
                // 可以设置颜色等
                // ECharts 会自动分配颜色，也可以自定义
                borderRadius: 8, // 给扇区加圆角
              },
            },
          ],
          // --- 移除 xAxis, yAxis, grid ---
        };
        // --- 饼图配置结束 ---

        this.chartInstance.setOption(initialOption);
      } else if (!chartDom) {
        console.error("EchartsPie: 图表容器 'chart' 未找到!");
      }
    },

    // 获取数据并更新图表的方法
    fetchAndUpdateChart() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;
      const userEmail = sessionStorage.getItem("email");

      if (!userEmail) {
        this.error = "未找到用户信息";
        this.isLoading = false;
        console.error("EchartsPie: 无法从 sessionStorage 获取 email");
        return;
      }

      axios
        .post(
          /* ... */
          "https://www.lloydyide.cn/fitbotAPI/getUserMInf.php",
          { email: userEmail },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          console.log("EchartsPie Response:", response.data);
          if (response.data && response.data.length > 0) {
            const res_data = response.data[0];

            // 提取 time_ 数据，仍然是数值数组
            const timeValuesRaw = Object.keys(res_data)
              .filter((key) => /^time_\d+$/.test(key))
              // (可选) 排序确保顺序与月份对应
              .sort(
                (a, b) =>
                  parseInt(a.split("_")[1], 10) - parseInt(b.split("_")[1], 10)
              )
              .map((key) => parseFloat(res_data[key]) || 0); // 确保是数字

            console.log("EchartsPie 提取到的 timeValues:", timeValuesRaw);

            // *** 转换数据格式为饼图需要的 [{value, name}, ...] ***
            const pieData = timeValuesRaw.map((value, index) => {
              return {
                value: value,
                name: MONTH_NAMES[index], // 使用预定义的月份名称
              };
            });
            // *** 格式转换结束 ***

            console.log(
              "EchartsPie 转换后的饼图数据:",
              JSON.stringify(pieData)
            );

            if (this.chartInstance) {
              // 更新图表数据
              this.chartInstance.setOption({
                // (可选) 如果图例数据也需要动态更新（比如月份不固定）
                // legend: {
                //   data: pieData.map(item => item.name)
                // },
                series: [
                  {
                    // 只需要更新 data
                    data: pieData,
                  },
                ],
              });
              console.log("EchartsPie: 饼图数据已更新");
            }
          } else {
            this.error = "未能从服务器获取有效数据";
            console.error(
              "EchartsPie: API 返回数据为空或格式不正确:",
              response.data
            );
          }
        })
        .catch((error) => {
          this.error = "加载数据失败";
          console.error("EchartsPie: 请求错误:", error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    handleResize() {
      if (this.chartInstance) {
        setTimeout(() => {
          if (this.chartInstance) {
            this.chartInstance.resize();
          }
        }, 200);
      }
    },
  },
};
</script>

