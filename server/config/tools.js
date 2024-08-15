// const productManagerTool = require("./tools/productManagerTool.json");
// const htmlTool = require("./tools/htmlTool.json");
// const scriptTool = require("./tools/scriptTool.json");
// const styleTool = require("./tools/styleTool.json");
// const contentTool = require("./tools/contentTool.json");
// const placeholderTool = require("./tools/placeholderTool.json");

const searchTool = require("./tools/searchTool.json");
const ctoTool = require("./tools/ctoTool.json");
const fileCreatorTool = require("./tools/fileCreatorTool.json");
const taskAssignerTool = require("./tools/taskAssignerTool.json");
const codeWriterTool = require("./tools/codeWriterTool.json");
const deployProjectTool = require("./tools/deployProjectTool.json");
const getDataForPortfolioTool = require("./tools/getDataForPortfolio.json");
const getDataForLandingPageTool = require("./tools/getDataForLandingPage.json");
const startShippingLandingPageTool = require("./tools/startShippingLandingPageTool.json");
const startShippingPortfolioTool = require("./tools/startShippingPortfolioTool.json");
const productManagerTool = require("./tools/productManagerTool.json");
const imageFinderTool = require("./tools/imageFinderTool.json");
const imageAnalysisTool = require("./tools/imageAnalysisTool.json");

const TOOLS = {
  SEARCH: "search_tool",
  GET_DATA_FOR_PORTFOLIO: "get_data_for_portfolio_tool",
  GET_DATA_FOR_LANDING_PAGE: "get_data_for_landing_page_tool",
  START_SHIPPING_LANDING_PAGE: "start_shipping_landing_page_tool",
  START_SHIPPING_PORTFOLIO: "start_shipping_portfolio_tool",
  CTO: "cto_tool",
  FILE_CREATOR: "file_creator_tool",
  TASK_ASSIGNER: "task_assigner_tool",
  CODE_WRITER: "code_writer_tool",
  DEPLOY_PROJECT: "deploy_project_tool",
  PRODUCT_MANAGER: "product_manager_tool",
  IMAGE_FINDER: "image_finder_tool",
  IMAGE_ANALYSIS: "image_analysis_tool",
};

module.exports = {
  searchTool,
  ctoTool,
  fileCreatorTool,
  taskAssignerTool,
  codeWriterTool,
  deployProjectTool,
  getDataForPortfolioTool,
  getDataForLandingPageTool,
  startShippingLandingPageTool,
  startShippingPortfolioTool,
  productManagerTool,
  imageFinderTool,
  imageAnalysisTool,
  TOOLS,
};
