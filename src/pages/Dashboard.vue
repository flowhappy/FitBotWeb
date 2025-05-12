<template>
  <div class="content">
    <div class="row">
      <div class="col-12">
        <card type="chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6" :class="'text-left'">
                <template>
                  <h5 class="card-category">训练数据</h5>
                </template>
                <template>
                  <h2
                    class="card-title"
                    style="font-size: 1.8rem; font-weight: bolder"
                  >
                    您的训练曲线
                  </h2>
                </template>
              </div>
              <div class="col-sm-6">
                <div
                  class="btn-group btn-group-toggle"
                  data-toggle="buttons"
                  :class="'float-right'"
                >
                  <template>
                    <label
                      v-for="(option, index) in bigLineChartCategories"
                      :key="option"
                      class="btn btn-success btn-sm btn-simple"
                      :class="{ active: bigLineChart.activeIndex === index }"
                      :id="index"
                    >
                      <input
                        type="radio"
                        @click="initBigChart(index)"
                        name="options"
                        autocomplete="off"
                        :checked="bigLineChart.activeIndex === index"
                      />
                      {{ option }}
                    </label>
                  </template>
                </div>
              </div>
            </div>
          </template>
          <line-chart
            class="chart-area"
            ref="bigChart"
            chart-id="big-line-chart"
            :chart-data="bigLineChart.chartData"
            :gradient-colors="bigLineChart.gradientColors"
            :gradient-stops="bigLineChart.gradientStops"
            :extra-options="bigLineChart.extraOptions"
          >
          </line-chart>
        </card>
      </div>
    </div>
    <div class="row">
      <echarts></echarts>
      <echarts2 style="margin-left: 5vw"></echarts2>
    </div>
  </div>
</template>
<script>
import { Card } from "@/components/index";
import LineChart from "@/components/Charts/LineChart";
import * as chartConfigs from "@/components/Charts/config";
import config from "@/config";
import { EventBus } from "../../event-bus.js";
import axios from "axios";
import echarts from "@/components/eCharts.vue";
import echarts2 from "@/components/eCharts2.vue";

export default {
  components: {
    Card,
    LineChart,
    echarts,
    echarts2,
  },
  data() {
    return {
      bigLineChartCategories: ["体重", "体脂率"],
      bigLineChart: {
        allData: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        activeIndex: 0,
        chartData: { datasets: [{}] },
        extraOptions: chartConfigs.purpleChartOptions,
        gradientColors: config.colors.primaryGradient,
        gradientStops: [1, 0.4, 0],
        categories: [],
      },
    };
  },
  methods: {
    initBigChart(index) {
      let chartData = {
        datasets: [
          {
            fill: true,
            borderColor: config.colors.primary,
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: config.colors.primary,
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: config.colors.primary,
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.bigLineChart.allData[index],
          },
        ],
        labels: [
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
      };
      this.$refs.bigChart.updateGradients(chartData);
      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    },
  },
  mounted() {
    this.i18n = this.$i18n;
    this.initBigChart(0);
    EventBus.$on("login_success", () => {
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

          const fat_percentageValues = Object.keys(res_data)
            .filter((key) => /^fat_percentage_\d+$/.test(key)) // 过滤出以 weight_ 开头的字段
            .map((key) => res_data[key]); // 提取对应的值
          user_monthly_info.push(fat_percentageValues);

          this.bigLineChart.allData = user_monthly_info;
          sessionStorage.setItem("umf", user_monthly_info);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("Error:", error); // 请求失败时的处理
        });
    });
  },
  created() {
    let umf = sessionStorage.getItem("umf");
    if (!umf) return;
    const umfArray = umf.split(",");

    const chunkedArray = [];
    for (let i = 0; i < umfArray.length; i += 12) {
      chunkedArray.push(umfArray.slice(i, i + 12));
    }
    console.log(chunkedArray);
    if (umf) {
      this.bigLineChart.allData = chunkedArray;
    }
  },
};
</script>
<style>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
