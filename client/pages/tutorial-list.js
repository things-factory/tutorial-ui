import { css, html } from "lit-element";
import { connect } from "pwa-helpers/connect-mixin.js";
import { i18next, localize } from "@things-factory/i18n-base";
import {
  client,
  CustomAlert,
  PageView,
  ScrollbarStyles,
  store,
} from "@things-factory/shell";
import { gqlBuilder, isMobileDevice } from "@things-factory/utils";
import gql from "graphql-tag";
import "@things-factory/form-ui";
import "@things-factory/grist-ui";

class TutorialList extends connect(store)(localize(i18next)(PageView)) {
  static get properties() {
    return {
      _searchFields: Array,
      tutorialVideos: Array,
    };
  }

  static get styles() {
    return [
      css`
        :host {
          padding: 20px;
          background-color: var(--tutorial-background-color);
        }
        .tutorial-page-header {
          background: url("../../assets/images/icon-tutorial.png") no-repeat;
          background-size: contain;
          margin-bottom: 20px;
          padding-left: 105px;
          min-height: 90px;
        }
        .tutorial-page-header h2 {
          margin: 0;
          font: var(--tutorial-title-font);
          color: var(--secondary-color);
          text-transform: capitalize;
        }
        .tutorial-page-header p {
          margin: 0;
          padding: 3px 0 7px 0;
          font: var(--tutorial-description-font);
          color: var(--primary-color);
        }
        .tutorial-page-header select {
          padding: var(--tutorial-header-field-padding);
          font: var(--tutorial-header-field-font);
          color: var(--secondary-color);
        }

        .grid-container {
          display: grid;
          grid-template-columns: var(--tutorial-grid-template);
          grid-gap: var(--tutorial-grid-gap);
        }

        .grid-item {
          cursor: pointer;
        }
        .grid-item span {
          display: block;
          padding: 3px 5px 1px 5px;
          width: 95%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        img {
          width: 100%;
        }
        a {
          border-radius: var(--border-radius, 4px);
          box-shadow: var(--box-shadow, 2px 2px 3px 0px rgba(0, 0, 0, 0.1));
          background-color: #fff;
          border: 2px solid transparent;
          overflow: hidden;
          text-decoration: none;
        }
        a:hover {
          border: 2px solid var(--primary-color);
        }
        .item-name {
          font: var(--tutorial-item-name-font);
          color: var(--secondary-color);
        }
        .item-description {
          font: var(--tutorial-item-description-font);
          color: var(--primary-color);
        }

        .item-duration {
          font-size: 13px;
          color: var(--secondary-color);
        }
        .item-duration mwc-icon {
          vertical-align: middle;
          font-size: 14px;
        }
      `,
    ];
  }

  get context() {
    return {
      title: i18next.t("title.tutorial"),
    };
  }

  render() {
    return html`
      <!--search-form
        id="search-form"
        .fields=${this._searchFields}
        @submit=${this.fetchHandler.bind(this)}
      ></search-form-->
      <div class="tutorial-page-header">
        <h2>OPERATO tutorials title</h2>
        <p>operato tutorial descrition message..</p>
        <select>
          <option>for warehouse customer</option>
          <option>for warehouse manager</option>
          <option>for warehouse operator</option>
        </select>
      </div>

      <div class="grid-container">
        ${!this.tutorialVideos || this.tutorialVideos.length == 0
          ? html` <div nolist>No Tutorial is found</div> `
          : this.tutorialVideos.map(
              (item, idx) => html`
                <a href=${item.resourceUrl} target="_blank">
                  <div class="grid-item">
                    <img src="${this.getYoutubeThumbnail(item.resourceUrl)}" />
                    <span class="item-name">${item.name}</span>
                    <span class="item-description">${item.description}</span>
                    <span class="item-duration"
                      ><mwc-icon>schedule</mwc-icon> ${item.duration}</span
                    >
                  </div>
                </a>
              `
            )}
      </div>
    `;
  }

  async pageInitialized() {
    this._searchFields = [
      {
        name: "name",
        label: i18next.t("title.name"),
        type: "text",
        props: {
          searchOper: "i_like",
        },
      },
      {
        name: "description",
        label: i18next.t("title.description"),
        type: "text",
        props: {
          searchOper: "i_like",
        },
      },
    ];

    await this.fetchHandler();
  }

  get searchForm() {
    return this.shadowRoot.querySelector("search-form");
  }

  async fetchHandler() {
    let filters = this?.searchForm?.queryFilters || [];
    const response = await client.query({
      query: gql`
        query {
          tutorialVideos: tutorialsWithRoles(${gqlBuilder.buildArgs({
            filters,
          })}) {
            id
            name
            description
            resourceUrl
            value
            duration
            rank
          }
        }
      `,
    });

    this.tutorialVideos = [...response.data.tutorialVideos];
  }

  //Filter youtube url to get video id
  getYoutubeThumbnail(link_url) {
    var thumbnail_link = "";
    var video_id = link_url.split("v=")[1];
    var ampersandPosition = video_id.indexOf("&");
    if (ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    thumbnail_link =
      "https://img.youtube.com/vi/" + video_id + "/hqdefault.jpg";
    return thumbnail_link;
  }

  _showToast({ type, message }) {
    document.dispatchEvent(
      new CustomEvent("notify", {
        detail: {
          type,
          message,
        },
      })
    );
  }
}

window.customElements.define("tutorial-list", TutorialList);
