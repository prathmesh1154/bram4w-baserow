import en from '@baserow/modules/automation/locales/en.json'
import fr from '@baserow/modules/automation/locales/fr.json'
import nl from '@baserow/modules/automation/locales/nl.json'
import de from '@baserow/modules/automation/locales/de.json'
import es from '@baserow/modules/automation/locales/es.json'
import it from '@baserow/modules/automation/locales/it.json'
import pl from '@baserow/modules/automation/locales/pl.json'
import ko from '@baserow/modules/automation/locales/ko.json'
import {
  GeneralAutomationSettingsType,
  IntegrationsAutomationSettingsType,
} from '@baserow/modules/automation/automationSettingTypes'

import { registerRealtimeEvents } from '@baserow/modules/automation/realtime'
import { AutomationApplicationType } from '@baserow/modules/automation/applicationTypes'
import automationApplicationStore from '@baserow/modules/automation/store/automationApplication'
import automationWorkflowStore from '@baserow/modules/automation/store/automationWorkflow'
import automationWorkflowNodeStore from '@baserow/modules/automation/store/automationWorkflowNode'
import {
  LocalBaserowCreateRowActionNodeType,
  LocalBaserowUpdateRowActionNodeType,
  LocalBaserowDeleteRowActionNodeType,
  LocalBaserowRowsCreatedTriggerNodeType,
  LocalBaserowRowsUpdatedTriggerNodeType,
  LocalBaserowRowsDeletedTriggerNodeType,
  CoreHttpRequestNodeType,
} from '@baserow/modules/automation/nodeTypes'
import { DuplicateAutomationWorkflowJobType } from '@baserow/modules/automation/jobTypes'
import { FF_AUTOMATION } from '@baserow/modules/core/plugins/featureFlags'
import {
  HistoryEditorSidePanelType,
  NodeEditorSidePanelType,
} from '@baserow/modules/automation/editorSidePanelTypes'
import { PreviousNodeDataProviderType } from '@baserow/modules/automation/dataProviderTypes'

export default (context) => {
  const { app, isDev, store } = context

  // Allow locale file hot reloading in dev
  if (isDev && app.i18n) {
    const { i18n } = app
    i18n.mergeLocaleMessage('en', en)
    i18n.mergeLocaleMessage('fr', fr)
    i18n.mergeLocaleMessage('nl', nl)
    i18n.mergeLocaleMessage('de', de)
    i18n.mergeLocaleMessage('es', es)
    i18n.mergeLocaleMessage('it', it)
    i18n.mergeLocaleMessage('pl', pl)
    i18n.mergeLocaleMessage('ko', ko)
  }

  registerRealtimeEvents(app.$realtime)

  store.registerModule('automationApplication', automationApplicationStore)
  store.registerModule('automationWorkflow', automationWorkflowStore)
  store.registerModule('automationWorkflowNode', automationWorkflowNodeStore)
  store.registerModule(
    'template/automationApplication',
    automationApplicationStore
  )

  if (app.$featureFlagIsEnabled(FF_AUTOMATION)) {
    app.$registry.register(
      'application',
      new AutomationApplicationType(context)
    )
    app.$registry.register(
      'automationDataProvider',
      new PreviousNodeDataProviderType(context)
    )
    app.$registry.register(
      'node',
      new LocalBaserowRowsCreatedTriggerNodeType(context)
    )
    app.$registry.register(
      'node',
      new LocalBaserowRowsUpdatedTriggerNodeType(context)
    )
    app.$registry.register(
      'node',
      new LocalBaserowRowsDeletedTriggerNodeType(context)
    )
    app.$registry.register(
      'node',
      new LocalBaserowCreateRowActionNodeType(context)
    )
    app.$registry.register(
      'node',
      new LocalBaserowUpdateRowActionNodeType(context)
    )
    app.$registry.register('node', new CoreHttpRequestNodeType(context))
    app.$registry.register(
      'node',
      new LocalBaserowDeleteRowActionNodeType(context)
    )
    app.$registry.register(
      'job',
      new DuplicateAutomationWorkflowJobType(context)
    )
    app.$registry.registerNamespace('automationSettings')
    app.$registry.register(
      'automationSettings',
      new GeneralAutomationSettingsType(context)
    )
    app.$registry.register(
      'automationSettings',
      new IntegrationsAutomationSettingsType(context)
    )
    app.$registry.register(
      'editorSidePanel',
      new NodeEditorSidePanelType(context)
    )
    app.$registry.register(
      'editorSidePanel',
      new HistoryEditorSidePanelType(context)
    )
  }
}
