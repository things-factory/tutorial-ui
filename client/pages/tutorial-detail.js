import { MultiColumnFormStyles } from '@things-factory/form-ui'
import { i18next, localize } from '@things-factory/i18n-base'
import { client } from '@things-factory/shell'
import { gqlBuilder, isMobileDevice } from '@things-factory/utils'
import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit-element'

class TutorialDetail extends localize(i18next)(LitElement) {
  static get properties() {
    return {
      tutorialId: String,
      name: String,
      description: Object,
      roleConfig: Object,
      data: Object
    }
  }

  static get styles() {
    return [
      MultiColumnFormStyles,
      css`
        :host {
          padding: 0 15px;
          display: flex;
          flex-direction: column;
          overflow-x: overlay;
          background-color: var(--main-section-background-color);
        }
        .grist {
          display: flex;
          flex: 1;
          overflow-y: auto;
        }
        .grist-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        data-grist {
          overflow-y: hidden;
          flex: 1;
        }
        h2 {
          margin: var(--subtitle-margin);
          padding: var(--subtitle-padding);
          font: var(--subtitle-font);
          color: var(--subtitle-text-color);
          border-bottom: var(--subtitle-border-bottom);
        }
        .button-container {
          padding: var(--button-container-padding);
          margin: var(--button-container-margin);
          text-align: var(--button-container-align);
          background-color: var(--button-container-background);
          height: var(--button-container-height);
        }
        .button-container button {
          background-color: var(--button-container-button-background-color);
          border-radius: var(--button-container-button-border-radius);
          height: var(--button-container-button-height);
          border: var(--button-container-button-border);
          margin: var(--button-container-button-margin);

          padding: var(--button-padding);
          color: var(--button-color);
          font: var(--button-font);
          text-transform: var(--button-text-transform);
        }
        .button-container button:hover,
        .button-container button:active {
          background-color: var(--button-background-focus-color);
        }
      `
    ]
  }

  get roleGrist() {
    return this.shadowRoot.querySelector('data-grist#role-grist')
  }

  get nameInput() {
    return this.shadowRoot.querySelector('input#name')
  }

  get descriptionInput() {
    return this.shadowRoot.querySelector('input#description')
  }

  render() {
    return html`
      <div>
        <h2>${i18next.t('title.tutorial')}</h2>
        <form class="multi-column-form">
          <fieldset>
            <label>${i18next.t('label.name')}</label>
            <input id="name" name="name" value="${this.name}" />

            <label>${i18next.t('label.description')}</label>
            <input id="description" name="description" value="${this.description}" />
          </fieldset>
        </form>
      </div>

      <div class="grist">
        <div class="grist-column">
          <h2>${i18next.t('title.role')}</h2>
          <data-grist
            id="role-grist"
            .mode="${isMobileDevice() ? 'LIST' : 'GRID'}"
            .config="${this.roleConfig}"
            .fetchHandler="${this.fetchHandler.bind(this)}"
          ></data-grist>
        </div>
      </div>

      <div class="button-container">
        <button @click="${this._saveTutorialRole}">${i18next.t('button.update')}</button>
      </div>
    `
  }

  firstUpdated() {
    this.roleConfig = {
      list: { fields: ['role'] },
      pagination: { infinite: true },
      rows: { appendable: true },
      columns: [
        {
          type: 'gutter',
          gutterName: 'sequence'
        },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.role'),
          record: {
            editable: false
          },
          width: 200
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: {
            editable: false
          },
          width: 250
        },
        {
          type: 'boolean',
          name: 'assigned',
          header: i18next.t('label.assigned'),
          record: {
            editable: true
          },
          width: 80
        }
      ]
    }
  }

  async fetchHandler() {
    const response = await client.query({
      query: gql`
        query {
          tutorialRoleAssignments(${gqlBuilder.buildArgs({
            tutorialId: this.tutorialId
          })}) {
            items{
              id
              name
              description
              assigned
            }
            total
          }
        }
      `
    })

    if (!response.errors) {
      return {
        total: response.data.tutorialRoleAssignments.total || 0,
        records: response.data.tutorialRoleAssignments.items || []
      }
    }
  }

  async _saveTutorialRole() {
    try {
      const response = await client.query({
        query: gql`
          mutation {
            updateRoleTutorial(${gqlBuilder.buildArgs({
              tutorialId: this.tutorialId,
              tutorialRoles: this._getCheckedRoles()
            })}) {
              id
              name
              role{
                id
                name
                description
              }
              tutorial{
                id
                name
                description
              }
              assigned
            }
          }
        `
      })

      if (!response.errors) {
        history.back()
        document.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              message: i18next.t('text.tutorial_detail_updated')
            }
          })
        )
      }
    } catch (e) {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: e.message
          }
        })
      )
    }
  }

  _getCheckedRoles() {
    this.roleGrist.commit()
    return this.roleGrist.data.records
      .filter(item => item.assigned)
      .map(item => {
        return {
          role: { id: item.id }
        }
      })
  }

  showToast(message, level = 'error') {
    document.dispatchEvent(
      new CustomEvent('notify', {
        detail: { level, message }
      })
    )
  }
}

window.customElements.define('tutorial-detail', TutorialDetail)
