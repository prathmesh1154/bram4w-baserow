import {
  ServiceType,
  DataSourceServiceTypeMixin,
  WorkflowActionServiceTypeMixin,
  TriggerServiceTypeMixin,
} from '@baserow/modules/core/serviceTypes'
import { LocalBaserowIntegrationType } from '@baserow/modules/integrations/localBaserow/integrationTypes'
import LocalBaserowGetRowForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowGetRowForm'
import LocalBaserowListRowsForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowListRowsForm'
import LocalBaserowUpsertRowServiceForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowUpsertRowServiceForm'
import LocalBaserowUpdateRowServiceForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowUpdateRowServiceForm'
import LocalBaserowDeleteRowServiceForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowDeleteRowServiceForm'
import LocalBaserowAggregateRowsForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowAggregateRowsForm'
import { uuid } from '@baserow/modules/core/utils/string'
import LocalBaserowAdhocHeader from '@baserow/modules/integrations/localBaserow/components/integrations/LocalBaserowAdhocHeader'
import { DistributionViewAggregationType } from '@baserow/modules/database/viewAggregationTypes'
import LocalBaserowSignalTriggerServiceForm from '@baserow/modules/integrations/localBaserow/components/services/LocalBaserowSignalTriggerServiceForm'

export class LocalBaserowTableServiceType extends ServiceType {
  get integrationType() {
    return this.app.$registry.get(
      'integration',
      LocalBaserowIntegrationType.getType()
    )
  }

  getDataSchema(service) {
    return service.schema
  }

  getContextDataSchema(service) {
    return service.context_data_schema
  }

  /**
   * Responsible for determining if this service is in error. It will be if the
   * `table_id` is missing.
   * @param service - The service object.
   * @returns {boolean} - If the service is valid.
   */
  getErrorMessage({ service }) {
    if (service !== undefined) {
      if (!service.table_id) {
        return this.app.i18n.t('serviceType.errorNoTableSelected')
      }
    }
    return super.getErrorMessage({ service })
  }

  /**
   * Responsible for returning the description of the service. This is used in
   * the UI to display a human-readable description of the service.
   *
   * @param service - The service object.
   * @param application - The application object.
   * @returns {string} - The description of the service.
   */
  getDescription(service, application) {
    const integration = this.app.store.getters[
      'integration/getIntegrationById'
    ](application, service.integration_id)

    const databases = integration?.context_data?.databases || []

    const tableSelected = databases
      .map((database) => database.tables)
      .flat()
      .find(({ id }) => id === service.table_id)

    let description = this.name
    if (service.table_id && tableSelected) {
      description += ` - ${tableSelected.name}`
    }

    if (this.isInError({ service })) {
      description += ` - ${this.getErrorMessage({ service })}`
    }

    return description
  }
}

export class DataSourceLocalBaserowTableServiceType extends DataSourceServiceTypeMixin(
  LocalBaserowTableServiceType
) {
  getIdProperty(service, record) {
    return 'id'
  }

  /**
   * Responsible for determining if this service is in error. It will be if the
   * `table_id` is missing, or if one or more filters/sortings point to a field that
   * has been trashed.
   * @param service - The service object.
   * @returns {boolean} - If the service is valid.
   */
  getErrorMessage({ service }) {
    if (service !== undefined) {
      const filtersInError = service.filters?.some((filter) => filter.trashed)
      if (filtersInError) {
        return this.app.i18n.t('serviceType.errorfilterInError')
      }

      const sortingsInError = service.sortings?.some(
        (sorting) => sorting.trashed
      )
      if (sortingsInError) {
        return this.app.i18n.t('serviceType.errorSortingInError')
      }
    }
    return super.getErrorMessage({ service })
  }
}

export class LocalBaserowGetRowServiceType extends DataSourceLocalBaserowTableServiceType {
  static getType() {
    return 'local_baserow_get_row'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowGetRow')
  }

  get formComponent() {
    return LocalBaserowGetRowForm
  }

  /**
   * A hook called prior to an update to modify the filters and
   * sortings if the `table_id` changes from one ID to another.
   * The same behavior happens in the backend, this reset is to
   * make the filter/sort components reset properly.
   */
  beforeUpdate(newValues, oldValues) {
    if (
      oldValues.table_id !== null &&
      newValues.table_id !== oldValues.table_id
    ) {
      newValues.filters = []
      newValues.sortings = []
    }
    return newValues
  }

  getOrder() {
    return 10
  }
}

export class LocalBaserowListRowsServiceType extends DataSourceLocalBaserowTableServiceType {
  static getType() {
    return 'local_baserow_list_rows'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowListRows')
  }

  get formComponent() {
    return LocalBaserowListRowsForm
  }

  /**
   * The Local Baserow adhoc filtering, sorting and searching component.
   */
  get adhocHeaderComponent() {
    return LocalBaserowAdhocHeader
  }

  get returnsList() {
    return true
  }

  getMaxResultLimit(service) {
    return this.app.$config.INTEGRATION_LOCAL_BASEROW_PAGE_SIZE_LIMIT
  }

  /**
   * A hook called prior to an update to modify the filters and
   * sortings if the `table_id` changes from one ID to another.
   * The same behavior happens in the backend, this reset is to
   * make the filter/sort components reset properly.
   */
  beforeUpdate(newValues, oldValues) {
    if (
      oldValues.table_id !== null &&
      newValues.table_id !== oldValues.table_id
    ) {
      newValues.filters = []
      newValues.sortings = []
    }
    return newValues
  }

  getDefaultCollectionFields(service) {
    return Object.keys(service.schema.items.properties)
      .filter(
        (field) =>
          field !== 'id' &&
          service.schema.items.properties[field].original_type !== 'formula' // every formula has different properties
      )
      .map((field) => {
        const type = service.schema.items.properties[field].type
        const originalType =
          service.schema.items.properties[field].original_type
        let outputType = 'text'
        let valueFormula = `get('current_record.${field}')`
        if (originalType === 'boolean') {
          outputType = 'boolean'
        } else if (originalType === 'rating') {
          outputType = 'rating'
        } else if (originalType === 'url') {
          return {
            link_name: valueFormula,
            name: service.schema.items.properties[field].title,
            id: uuid(), // Temporary id
            navigate_to_page_id: null,
            navigate_to_url: valueFormula,
            navigation_type: 'custom',
            page_parameters: [],
            target: 'blank',
            type: 'link',
          }
        } else if (originalType === 'file') {
          return {
            id: uuid(),
            name: service.schema.items.properties[field].title,
            type: 'image',
            src: `get('current_record.${field}.*.url')`,
            alt: `get('current_record.${field}.*.visible_name')`,
          }
        } else if (
          originalType === 'last_modified_by' ||
          originalType === 'created_by'
        ) {
          valueFormula = `get('current_record.${field}.name')`
        } else if (originalType === 'single_select') {
          valueFormula = `get('current_record.${field}.value')`
        }
        if (originalType === 'multiple_collaborators') {
          valueFormula = `get('current_record.${field}.*.name')`
        } else if (type === 'array') {
          valueFormula = `get('current_record.${field}.*.value')`
        }
        return {
          name: service.schema.items.properties[field].title,
          type: outputType,
          value: valueFormula,
          id: uuid(), // Temporary id
        }
      })
  }

  getRecordName(service, record) {
    // We skip row_id and order properties here, so we keep only first key
    // that should be the primary field
    // [{ field_1234: 'The name of the record', id: 0, __idx__: 0 }]
    // NOTE: This is assuming that the first field is the primary field.
    const field = Object.keys(record).find((key) => key.startsWith('field_'))
    return record[field]
  }

  getOrder() {
    return 20
  }
}

export class LocalBaserowAggregateRowsServiceType extends DataSourceLocalBaserowTableServiceType {
  static getType() {
    return 'local_baserow_aggregate_rows'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowAggregateRows')
  }

  get formComponent() {
    return LocalBaserowAggregateRowsForm
  }

  /**
   * Local Baserow aggregate rows does not currently support the distribution
   * aggregation type, this will be resolved in a future release.
   */
  get unsupportedAggregationTypes() {
    return [DistributionViewAggregationType.getType()]
  }

  getResult(service, data) {
    if (data && data.result !== undefined && service !== undefined) {
      const field = service.context_data.field
      const fieldType = this.app.$registry.get('field', field.type)
      const aggregationType = this.app.$registry.get(
        'viewAggregation',
        service.aggregation_type
      )
      const formattedResult = aggregationType.formatValue(data.result, {
        field,
        fieldType,
      })
      return formattedResult
    }
    return null
  }

  getErrorMessage({ service }) {
    if (service !== undefined) {
      if (!service.field_id) {
        return this.app.i18n.t('serviceType.errorNoFieldSelected')
      }
      if (!service.aggregation_type) {
        return this.app.i18n.t('serviceType.errorNoAggregationTypeSelected')
      }
      const filtersInError = service.filters.some((filter) => filter.trashed)
      if (filtersInError) {
        return this.app.i18n.t('serviceType.errorFilterInError')
      }
    }
    return super.getErrorMessage({ service })
  }

  getDescription(service, application) {
    const integration = this.app.store.getters[
      'integration/getIntegrationById'
    ](application, service.integration_id)

    const databases = integration?.context_data?.databases || []

    const tableSelected = databases
      .map((database) => database.tables)
      .flat()
      .find(({ id }) => id === service.table_id)

    if (service.table_id && tableSelected) {
      const defaultTableDescription = `${this.name} - ${tableSelected.name}`
      if (service.field_id) {
        if (service.context_data.field) {
          const fieldName = service.context_data.field.name
          return `${defaultTableDescription} - ${fieldName}`
        } else {
          return `${defaultTableDescription} - ${this.app.i18n.t(
            'serviceType.trashedField'
          )}`
        }
      }

      return defaultTableDescription
    }

    return this.name
  }

  getOrder() {
    return 30
  }
}

export class LocalBaserowCreateRowWorkflowServiceType extends WorkflowActionServiceTypeMixin(
  LocalBaserowTableServiceType
) {
  static getType() {
    return 'local_baserow_create_row'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowCreateRow')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowCreateRowDescription')
  }

  get formComponent() {
    return LocalBaserowUpsertRowServiceForm
  }
}

export class LocalBaserowUpdateRowWorkflowServiceType extends WorkflowActionServiceTypeMixin(
  LocalBaserowTableServiceType
) {
  static getType() {
    return 'local_baserow_update_row'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowUpdateRow')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowUpdateRowDescription')
  }

  get formComponent() {
    return LocalBaserowUpdateRowServiceForm
  }
}

export class LocalBaserowDeleteRowWorkflowServiceType extends WorkflowActionServiceTypeMixin(
  LocalBaserowTableServiceType
) {
  static getType() {
    return 'local_baserow_delete_row'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowDeleteRow')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowDeleteRowDescription')
  }

  get formComponent() {
    return LocalBaserowDeleteRowServiceForm
  }
}

export class LocalBaserowTriggerServiceType extends TriggerServiceTypeMixin(
  LocalBaserowTableServiceType
) {
  getErrorMessage({ service }) {
    if (service !== undefined) {
      if (!service.table_id) {
        this.app.i18n.t('serviceType.errorNoTableSelected')
      }
    }
    return super.getErrorMessage({ service })
  }
}

export class LocalBaserowRowsCreatedTriggerServiceType extends LocalBaserowTriggerServiceType {
  static getType() {
    return 'rows_created'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowRowsCreated')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowRowsCreatedDescription')
  }

  get formComponent() {
    return LocalBaserowSignalTriggerServiceForm
  }
}

export class LocalBaserowRowsUpdatedTriggerServiceType extends LocalBaserowTriggerServiceType {
  static getType() {
    return 'rows_updated'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowRowsUpdated')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowRowsUpdatedDescription')
  }

  get formComponent() {
    return LocalBaserowSignalTriggerServiceForm
  }
}

export class LocalBaserowRowsDeletedTriggerServiceType extends LocalBaserowTriggerServiceType {
  static getType() {
    return 'rows_deleted'
  }

  get name() {
    return this.app.i18n.t('serviceType.localBaserowRowsDeleted')
  }

  get description() {
    return this.app.i18n.t('serviceType.localBaserowRowsDeletedDescription')
  }

  get formComponent() {
    return LocalBaserowSignalTriggerServiceForm
  }
}
