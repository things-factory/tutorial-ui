import { LitElement, html, css } from 'lit-element'
import { ScrollbarStyles } from '@things-factory/shell'

export class OpenSourceLicense extends LitElement {
  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: flex;
          flex-direction: row;

          background-color: white;
          padding: 12px 5px 12px 15px;

          font-size: 13px;
          color: #333;
        }

        [licenses] {
          flex: 1;
          overflow: auto;
          margin: 0;
          padding: 0;
        }
        li::before {
          content: '- ';
        }
        li {
          padding: 2px 0 1px 0;
        }
        a {
          color: #22a6a7;
        }
      `
    ]
  }
  static get properties() {
    return {
      licenses: Object
    }
  }

  async firstUpdated() {
    try {
      const response = await fetch('/licenses', {
        method: 'GET'
      })

      if (response.ok) {
        this.licenses = await response.json()
        console.log(this.licenses)
      } else {
        throw new Error(response)
      }
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    var licenses = this.licenses || {}

    return html`
      <ul licenses>
        ${Object.keys(licenses).map(name => {
          var license = licenses[name]

          return html`
            <li>
              <span>${name}</span>
              <a href=${license.licenseUrl}>${license.licenses}</a>
            </li>
          `
        })}
      </ul>
    `
  }
}

customElements.define('opensource-license', OpenSourceLicense)
