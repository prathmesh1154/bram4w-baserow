import { Registerable } from '@baserow/modules/core/registry'
import {
  ActionNodeTypeMixin,
  TriggerNodeTypeMixin,
} from '@baserow/modules/automation/nodeTypeMixins'
import {
  LocalBaserowCreateRowWorkflowServiceType,
  LocalBaserowUpdateRowWorkflowServiceType,
  LocalBaserowDeleteRowWorkflowServiceType,
  LocalBaserowRowsCreatedTriggerServiceType,
  LocalBaserowRowsDeletedTriggerServiceType,
  LocalBaserowRowsUpdatedTriggerServiceType,
} from '@baserow/modules/integrations/localBaserow/serviceTypes'
import localBaserowIntegration from '@baserow/modules/integrations/localBaserow/assets/images/localBaserowIntegration.svg'
import { CoreHTTPRequestServiceType } from '@baserow/modules/integrations/core/serviceTypes'

export class NodeType extends Registerable {
  /**
   * The display name of the node type, we use this value
   * in create/update node lists.
   * The name is derived from the service type's name.
   * @returns {string} - The display name for the node.
   */
  get name() {
    return this.serviceType.name
  }

  /**
   * The display label of the node type, we use this value
   * in the editor when rendering the node. By default, it
   * just returns the name, but can be overridden.
   * @returns {string} - The display label for the node.
   */
  getLabel({ node }) {
    return this.name
  }

  /**
   * The node type's description.
   * The description is derived from the service type's description.
   * @returns {string} - The node's description.
   */
  get description() {
    return this.serviceType.description
  }

  /**
   * New nodes must implement this method to return their
   * specific service type.
   * @throws {Error} If the method is not implemented.
   */
  get serviceType() {
    throw new Error('This method must be implemented')
  }

  /**
   * The icon which is shown inside the editor's node.
   * @returns {string} - The node's icon class.
   */
  get iconClass() {
    return 'iconoir-table'
  }

  /**
   * The node type's image, which will be displayed in dropdowns.
   * @returns - The node's image.
   */
  get image() {
    return localBaserowIntegration
  }

  /**
   * The node type's editor component. Not yet implemented.
   * @returns {object|null} - The node's editor component.
   */
  get component() {
    return null
  }

  /**
   * The node type's form component.
   * The component is derived from the service type's form component.
   * @returns {object} - The node's form component.
   */
  get formComponent() {
    return this.serviceType.formComponent
  }

  /**
   * Returns whether the node is in-error or not.
   * By default, this is derived from the service type's `isInError`
   * method, but can be overridden by the node type.
   * @returns {boolean} - Whether the properties are in-error.
   */
  isInError({ service }) {
    return this.serviceType.isInError({ service })
  }

  /**
   * Returns this node's data type, used by the `getDataSchema` method
   * to inform the schema about what kind of data type this node returns.
   *
   * @returns {string} - The data type of the node, which is 'object' by default.
   */
  get dataType() {
    return 'object'
  }

  /**
   * Generates the data schema for the node, used by the data provider.
   * Constructed by retrieving the service schema for this node's service.
   * @param automation - The automation the node belongs to.
   * @param node - The node for which the data schema is being generated.
   * @returns {object} - The data schema for the node.
   */
  getDataSchema({ automation, node }) {
    const serviceSchema = this.serviceType.getDataSchema(node.service)
    return {
      type: this.dataType,
      title: this.getLabel({ automation, node }),
      properties: serviceSchema.properties || {},
      items: serviceSchema.items || [],
    }
  }
}

export class LocalBaserowNodeType extends NodeType {
  /**
   * Responsible for returning contextual data for a node label template.
   * At the moment we only refer to the table name.
   *
   * @param automation - the automation the node belongs to.
   * @param node - The node for which the label context is being retrieved.
   * @returns {object} - An object containing the table name.
   */
  getLabelContext({ automation, node }) {
    const integration = this.app.store.getters[
      'integration/getIntegrationById'
    ](automation, node.service?.integration_id)
    const databases = integration?.context_data?.databases || []
    const tableSelected = databases
      .map((database) => database.tables)
      .flat()
      .find(({ id }) => id === node.service.table_id)

    return { tableName: tableSelected?.name }
  }

  /**
   * Responsible for returning this Local Baserow node's label, which is
   * displayed in the editor.
   *
   * @param automation - The automation the node belongs to.
   * @param node - The node for which the label is being retrieved.
   * @returns {string} - if a table name is found, it returns the label
   *  referencing the table name, otherwise it returns the node's `name`.
   */
  getLabel({ automation, node }) {
    const { tableName } = this.getLabelContext({ automation, node })
    return tableName
      ? this.app.i18n.t(this.labelTemplateName, { tableName })
      : this.name
  }
}

export class LocalBaserowSignalTriggerType extends LocalBaserowNodeType {
  /**
   * All Local Baserow signal triggers return an array of rows,
   * so we override the `dataType` method to return 'array'.
   * @returns {string} - The data type of the node, which is 'array'.
   */
  get dataType() {
    return 'array'
  }
}

export class LocalBaserowRowsCreatedTriggerNodeType extends TriggerNodeTypeMixin(
  LocalBaserowSignalTriggerType
) {
  static getType() {
    return 'rows_created'
  }

  getOrder() {
    return 1
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowRowsCreatedLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowRowsCreatedTriggerServiceType.getType()
    )
  }
}

export class LocalBaserowRowsUpdatedTriggerNodeType extends TriggerNodeTypeMixin(
  LocalBaserowSignalTriggerType
) {
  static getType() {
    return 'rows_updated'
  }

  getOrder() {
    return 2
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowRowsUpdatedLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowRowsUpdatedTriggerServiceType.getType()
    )
  }
}

export class LocalBaserowRowsDeletedTriggerNodeType extends TriggerNodeTypeMixin(
  LocalBaserowSignalTriggerType
) {
  static getType() {
    return 'rows_deleted'
  }

  getOrder() {
    return 3
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowRowsDeletedLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowRowsDeletedTriggerServiceType.getType()
    )
  }
}

export class LocalBaserowCreateRowActionNodeType extends ActionNodeTypeMixin(
  LocalBaserowNodeType
) {
  static getType() {
    return 'create_row'
  }

  getOrder() {
    return 1
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowCreateRowLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowCreateRowWorkflowServiceType.getType()
    )
  }
}

export class LocalBaserowUpdateRowActionNodeType extends ActionNodeTypeMixin(
  LocalBaserowNodeType
) {
  static getType() {
    return 'update_row'
  }

  getOrder() {
    return 2
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowUpdateRowLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowUpdateRowWorkflowServiceType.getType()
    )
  }
}

export class LocalBaserowDeleteRowActionNodeType extends ActionNodeTypeMixin(
  LocalBaserowNodeType
) {
  static getType() {
    return 'delete_row'
  }

  getOrder() {
    return 3
  }

  get labelTemplateName() {
    return 'nodeType.localBaserowDeleteRowLabel'
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      LocalBaserowDeleteRowWorkflowServiceType.getType()
    )
  }
}

export class CoreHttpRequestNodeType extends ActionNodeTypeMixin(NodeType) {
  static getType() {
    return 'http_request'
  }

  getOrder() {
    return 4
  }

  get iconClass() {
    return 'iconoir-globe'
  }

  get name() {
    return this.app.i18n.t('nodeType.httpRequestLabel')
  }

  get serviceType() {
    return this.app.$registry.get(
      'service',
      CoreHTTPRequestServiceType.getType()
    )
  }
}
