import { getCodeByName } from '@things-factory/code-base'
import '@things-factory/form-ui'
import '@things-factory/grist-ui'
import { i18next, localize } from '@things-factory/i18n-base'
import { client, PageView, store } from '@things-factory/shell'
import { gqlBuilder } from '@things-factory/utils'
import gql from 'graphql-tag'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'

class TutorialList extends connect(store)(localize(i18next)(PageView)) {
  static get properties() {
    return {
      _searchFields: Array,
      tutorialVideos: Array,
      roleNameList: Array,
      roleId: String,
      _user: String,
      userRoles: Array,
      userRole: String
    }
  }

  static get styles() {
    return [
      css`
        :host {
          padding: 20px;
          background-color: var(--tutorial-background-color);
        }
        .tutorial-page-header {
          background: url('../../assets/images/icon-tutorial.png') no-repeat;
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
      `
    ]
  }

  get context() {
    return {
      title: i18next.t('title.tutorial')
    }
  }

  render() {
    return html`
      <div class="tutorial-page-header">
        <h2>${i18next.t('title.operato_tutorials')}</h2>
        <p>${i18next.t('text.guide_of_modules')}</p>
        <select id="role_list" @change="${this.fetchHandler}">
          ${!this.roleNameList || this.roleNameList.length == 0
            ? html` <option></option> `
            : this.roleNameList.map(
                roleNameList => html` <option value="${roleNameList.description}">${roleNameList.name}</option> `
              )}
        </select>
      </div>

      <div class="grid-container">
        ${!this.tutorialVideos || this.tutorialVideos.length == 0
          ? html` <div nolist>${i18next.t('text.no_tutorial_is_available')}</div> `
          : this.tutorialVideos.map(
              (item, idx) => html`
                <a href=${item.resourceUrl} target="_blank">
                  <div class="grid-item">
                    <img src="${this.getYoutubeThumbnail(item.resourceUrl)}" />
                    <span class="item-name">${item.name}</span>
                    <span class="item-description">${item.description}</span>
                    <span class="item-duration"><mwc-icon>schedule</mwc-icon> ${item.duration}</span>
                  </div>
                </a>
              `
            )}
      </div>
    `
  }

  async pageInitialized() {
    this.roleNameList = await getCodeByName('TUTORIAL_ROLES_PRIORITY')
    await this.fetchUserRoleHandler()
    this.getRole()
    await this.fetchHandler()
  }

  get roleList() {
    return this.shadowRoot.querySelector('#role_list')
  }

  async fetchRoleListHandler() {
    let filters = []
    const response = await client.query({
      query: gql`
        query {
          roleNameList: listByRoles(${gqlBuilder.buildArgs({
            filters
          })}) {
            id
            name
          }
        }
      `
    })

    this.roleNameList = [...response.data.roleNameList]
  }

  async fetchUserRoleHandler() {
    const response = await client.query({
      query: gql`
        query {
          userRoles: userRoles(${gqlBuilder.buildArgs({
            userId: this._user
          })}) {
            id
            name
            description
            assigned
          }
        }
      `
    })

    this.userRoles = [...response.data.userRoles]
  }

  async fetchHandler() {
    const response = await client.query({
      query: gql`
        query {
          tutorialsWithRoles(${gqlBuilder.buildArgs({
            roleNames: this.roleList.value || []
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
      `
    })

    this.tutorialVideos = [...response.data.tutorialsWithRoles]
  }

  getRole() {
    this.userRoles
      .filter(x => x.assigned == true)
      .map(itm => {
        let roleList = this.roleNameList.filter(x => x.name == String(itm.name).toUpperCase())[0]
        if (roleList) {
          this.userRole = roleList.name
        }
      })
  }

  stateChanged(state) {
    if (state.auth.user) this._user = state.auth && state.auth.user && state.auth.user.id
  }

  //Filter youtube url to get video id
  getYoutubeThumbnail(link_url) {
    var thumbnail_link = ''
    var video_id = link_url.split('v=')[1]
    var ampersandPosition = video_id.indexOf('&')
    if (ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition)
    }
    thumbnail_link = 'https://img.youtube.com/vi/' + video_id + '/hqdefault.jpg'
    return thumbnail_link
  }

  _showToast({ type, message }) {
    document.dispatchEvent(
      new CustomEvent('notify', {
        detail: {
          type,
          message
        }
      })
    )
  }
}

window.customElements.define('tutorial-list', TutorialList)
