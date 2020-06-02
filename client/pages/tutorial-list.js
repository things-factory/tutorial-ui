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
        img {
          width: 100%;
          height: 300px;
        }

        .grid-container {
          display: grid;
          grid-template-columns: auto auto auto auto;
          grid-gap: 20px 20px;
          padding: 30px;
        }

        .grid-item {
          background-color: rgba(255, 255, 255, 0.8);
          box-shadow: 2px 5px 8px 8px #f4f4f4;
          font-size: 15px;
          text-align: left;
          cursor: pointer;
          width: 400px;
        }

        .grid-content {
          padding-left: 5px;
        }

        a:link {
          text-decoration: none;
          color: #464343;
        }

        a:visited {
          text-decoration: none;
          color: #464343;
        }

        a:hover {
          text-decoration: underline;
          color: #464343;
        }

        a:active {
          text-decoration: underline;
          color: #464343;
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
      <search-form
        id="search-form"
        .fields=${this._searchFields}
        @submit=${this.fetchHandler.bind(this)}
      ></search-form>

      <div class="grid-container">
        ${!this.tutorialVideos || this.tutorialVideos.length == 0
          ? html` <div nolist>No Tutorial is found</div> `
          : this.tutorialVideos.map(
              (item, idx) => html`
                <a href=${item.resourceUrl} target="_blank">
                  <div class="grid-item">
                    <img
                      src="${this.getYoutubeThumbnail(item.resourceUrl)}"
                    /><br />
                    <span class="grid-content">${item.name}</span><br />
                    <span class="grid-content">${item.description}</span><br />
                    <span class="grid-content">${item.duration}</span><br />
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
