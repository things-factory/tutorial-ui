export default function route(page) {
  switch (page) {
    case "tutorial_setting":
      import("./pages/tutorial-setting-list");
      return page;

    case "tutorial_list":
      import("./pages/tutorial-list");
      return page;
  }
}
