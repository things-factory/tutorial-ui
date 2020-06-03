import { html } from "lit-element";

import "@material/mwc-icon";

import { store, navigate } from "@things-factory/shell";
import { ADD_MORENDA } from "@things-factory/more-base";

export default function bootstrap() {
  /* add tutorial morenda */
  store.dispatch({
    type: ADD_MORENDA,
    morenda: {
      icon: html` <mwc-icon>book</mwc-icon> `,
      name: html` <i18n-msg msgid="label.tutorial"></i18n-msg> `,
      action: () => {
        navigate("tutorial_list");
      },
    },
  });
}
