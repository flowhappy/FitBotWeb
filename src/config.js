export default {
  colors: {
    default: "#344675",
    primary: "#42b883",
    info: "#1d8cf8",
    danger: "#fd5d93",
    teal: "#00d6b4",
    primaryGradient: [
      "rgba(76, 211, 150, 0.1)",
      "rgba(53, 183, 125, 0)",
      "rgba(119,52,169,0)",
    ],
  },
  devServer: {
    hot: false, // 关闭热加载
  },
  productionSourceMap: false, // Disable source maps in production
  configureWebpack: {
    devtool: "none", // Disable source maps in development mode
  },
  devtool: "source-map", // 生成源映射
  stats: {
    warnings: false, // 抑制警告
  },
};
