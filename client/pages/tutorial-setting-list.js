import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { i18next, localize } from '@things-factory/i18n-base'
import { openPopup } from '@things-factory/layout-base'
import gql from 'graphql-tag'
import { client, CustomAlert, PageView, ScrollbarStyles, store } from '@things-factory/shell'
import { gqlBuilder, isMobileDevice } from '@things-factory/utils'
import '@things-factory/form-ui'
import '@things-factory/grist-ui'
import './tutorial-detail'

class TutorialSettingList extends connect(store)(localize(i18next)(PageView)) {
  static get properties() {
    return {
      _searchFields: Array,
      config: Object,
      data: Object
    }
  }

  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        search-form {
          overflow: visible;
        }

        data-grist {
          overflow-y: auto;
          flex: 1;
        }
      `
    ]
  }

  get context() {
    return {
      title: i18next.t('title.tutorial_setting'),
      actions: [
        {
          title: i18next.t('button.save'),
          action: this._saveTutorial.bind(this)
        },
        {
          title: i18next.t('button.delete'),
          action: this._deleteTutorial.bind(this)
        }
      ]
    }
  }

  render() {
    return html`
      <search-form id="search-form" .fields=${this._searchFields} @submit=${() => this.dataGrist.fetch()}></search-form>
      <data-grist
        .mode=${isMobileDevice() ? 'LIST' : 'GRID'}
        .config=${this.config}
        .fetchHandler="${this.fetchHandler.bind(this)}"
      ></data-grist>
    `
  }

  pageUpdated(changes, lifecycle) {
    if (this.active) {
      this.dataGrist.fetch()
    }
  }

  async pageInitialized() {
    this._searchFields = [
      {
        name: 'name',
        label: i18next.t('field.name'),
        type: 'text',
        props: {
          searchOper: 'i_like'
        }
      },
      {
        name: 'description',
        label: i18next.t('field.description'),
        type: 'text',
        props: {
          searchOper: 'i_like'
        }
      },
      {
        name: 'resourceUrl',
        name: i18next.t('field.resource_url'),
        type: 'text',
        props: {
          searchOper: 'i_like'
        }
      }
    ]

    this.config = {
      rows: { selectable: { multiple: true } },
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: 'reorder',
          handlers: {
            click: (columns, data, column, record, rowIndex) => {
              openPopup(
                html`
                  <tutorial-detail
                    @role-updated="${() => {
                      document.dispatchEvent(
                        new CustomEvent('notify', {
                          detail: {
                            message: i18next.t('text.info_update_successfully')
                          }
                        })
                      )
                      this.dataGrist.fetch()
                    }}"
                    .tutorialId="${record.id}"
                    .name="${record.name}"
                    .description="${record.description}"
                  ></tutorial-detail>
                `,
                {
                  backdrop: true,
                  size: 'large',
                  title: `${i18next.t('title.tutorial_detail')} - ${record.name}`
                }
              )
            }
          }
        },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.name'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 200
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 300
        },
        {
          type: 'string',
          name: 'resourceUrl',
          header: i18next.t('field.resource_url'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 300
        },
        {
          type: 'string',
          name: 'value',
          header: i18next.t('field.value'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 300
        },
        {
          type: 'string',
          name: 'duration',
          header: i18next.t('field.duration'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 300
        },
        {
          type: 'integer',
          name: 'rank',
          header: i18next.t('field.rank'),
          record: { editable: true, align: 'center' },
          sortable: true,
          width: 80
        }
      ]
    }
  }

  get searchForm() {
    return this.shadowRoot.querySelector('search-form')
  }

  get dataGrist() {
    return this.shadowRoot.querySelector('data-grist')
  }

  async fetchHandler({ page, limit, sorters = [] }) {
    const response = await client.query({
      query: gql`
        query {
          tutorials(${gqlBuilder.buildArgs({
            filters: this.searchForm.queryFilters,
            pagination: { page, limit },
            sortings: sorters
          })}) {
            items {
              id
              name
              description
              resourceUrl
              value
              duration
              rank
            }
            total
          }
        }
      `
    })
    return {
      total: response.data.tutorials.total || 0,
      records: response.data.tutorials.items || []
    }
  }

  async _saveTutorial() {
    let patches = this.dataGrist.exportPatchList({ flagName: 'cuFlag' })
    if (patches && patches.length) {
      const response = await client.query({
        query: gql`
          mutation {
            updateMultipleTutorial(${gqlBuilder.buildArgs({
              patches
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
      if (!response.errors) {
        this.dataGrist.fetch()
        document.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              message: i18next.t('text.data_updated_successfully')
            }
          })
        )
      }
    }
  }

  async _deleteTutorial() {
    CustomAlert({
      title: i18next.t('text.are_you_sure'),
      text: i18next.t('text.you_wont_be_able_to_revert_this'),
      type: 'warning',
      confirmButton: { text: i18next.t('button.delete'), color: '#22a6a7' },
      cancelButton: { text: 'cancel', color: '#cfcfcf' },
      callback: async result => {
        if (result.value) {
          const ids = this.dataGrist.selected.map(record => record.id)
          if (ids && ids.length > 0) {
            const response = await client.query({
              query: gql`
              mutation {
                deleteTutorials(${gqlBuilder.buildArgs({ ids })})
              }
            `
            })
            if (!response.errors) {
              this.dataGrist.fetch()
              document.dispatchEvent(
                new CustomEvent('notify', {
                  detail: {
                    message: i18next.t('text.data_deleted_successfully')
                  }
                })
              )
            }
          }
        }
      }
    })
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

window.customElements.define('tutorial-setting-list', TutorialSettingList)
