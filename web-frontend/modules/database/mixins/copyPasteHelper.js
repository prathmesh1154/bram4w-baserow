/**
 * A mixin that can be used to copy and paste row values.
 */

import {
  getRichClipboard,
  setRichClipboard,
  LOCAL_STORAGE_CLIPBOARD_KEY,
} from '@baserow/modules/database/utils/clipboard'

const PAPA_CONFIG = {
  delimiter: '\t',
}

export default {
  methods: {
    prepareValuesForCopy(fields, rows, includeHeader) {
      const textData = []
      const jsonData = []
      if (includeHeader) {
        textData.push(fields.map((field) => field.name))
        jsonData.push(fields.map((field) => field.name))
      }
      for (const row of rows) {
        const text = fields.map((field) =>
          this.$registry
            .get('field', field.type)
            .prepareValueForCopy(field, row['field_' + field.id])
        )
        const json = fields.map((field) =>
          this.$registry
            .get('field', field.type)
            .prepareRichValueForCopy(field, row['field_' + field.id])
        )
        textData.push(text)
        jsonData.push(json)
      }
      return { textData, jsonData }
    },
    prepareHTMLData(textData, firstRowIsHeader) {
      const table = document.createElement('table')
      const tbody = document.createElement('tbody')

      // For single cells we don't need html clipboard data as it's
      // conflicting with tiptap
      if (textData.length === 1 && textData[0].length === 1) {
        return
      }

      textData.forEach((row, index) => {
        const tr = document.createElement('tr')
        row.forEach((cell) => {
          const td = document.createElement(
            firstRowIsHeader && index === 0 ? 'th' : 'td'
          )
          td.textContent = cell
          tr.appendChild(td)
        })
        tbody.appendChild(tr)
      })
      table.appendChild(tbody)
      return table.outerHTML
    },
    showCopyClipboardError() {
      this.$store.dispatch(
        'toast/error',
        {
          title: this.$t('action.copyToClipboard'),
          message: this.$t('error.copyFailed'),
        },
        { root: true }
      )
    },
    async copySelectionToClipboard(selectionPromise, includeHeader = false) {
      const { textData, jsonData } = await selectionPromise.then(
        ([fields, rows]) =>
          this.prepareValuesForCopy(fields, rows, includeHeader)
      )
      const tsvData = this.$papa.unparse(textData, PAPA_CONFIG)
      const htmlData = this.prepareHTMLData(textData, includeHeader)
      try {
        localStorage.setItem(
          LOCAL_STORAGE_CLIPBOARD_KEY,
          JSON.stringify({ text: tsvData, json: jsonData })
        )
      } catch (e) {
        this.showCopyClipboardError()
      }

      try {
        await this.writeToClipboard(tsvData, htmlData)
      } catch (e) {
        if (!document.hasFocus()) {
          window.addEventListener(
            'focus',
            () => this.writeToClipboard(tsvData, htmlData),
            { once: true }
          )
        } else {
          this.showCopyClipboardError()
        }
      }
    },
    async writeToClipboard(tsvData, htmlData) {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardConfig = {
          'text/plain': new Blob([tsvData], { type: 'text/plain' }),
        }
        if (htmlData) {
          clipboardConfig['text/html'] = new Blob([htmlData], {
            type: 'text/html',
          })
        }
        await navigator.clipboard.write([new ClipboardItem(clipboardConfig)])
      } else if (typeof navigator.clipboard?.writeText !== 'undefined') {
        await navigator.clipboard.writeText(tsvData)
      } else {
        const richClipboardConfig = { 'text/plain': tsvData }
        if (htmlData) {
          richClipboardConfig['text/html'] = htmlData
        }
        setRichClipboard(richClipboardConfig)
      }
    },
    async extractClipboardData(event) {
      const { textRawData, jsonRawData } = await getRichClipboard(event)
      const { data: textData } = await this.$papa.parsePromise(
        textRawData,
        PAPA_CONFIG
      )

      let jsonData = null
      if (jsonRawData != null) {
        // Check if we have an array of arrays with At least one row with at least
        // one row with a value Otherwise the paste is empty
        if (
          Array.isArray(jsonRawData) &&
          jsonRawData.length === textData.length &&
          jsonRawData.every((row) => Array.isArray(row)) &&
          jsonRawData.some((row) => row.length > 0)
        ) {
          jsonData = jsonRawData
        }
      }

      return [textData, jsonData]
    },
  },
}
