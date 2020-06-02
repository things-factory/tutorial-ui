import route from "./client/route";
import bootstrap from "./client/bootstrap";

export default {
  route,
  routes: [
    {
      tagname: "tutorial-setting-list",
      page: "tutorial_setting",
    },
    {
      tagname: "tutorial-list",
      page: "tutorial_list",
    },
  ],
  bootstrap,
};
