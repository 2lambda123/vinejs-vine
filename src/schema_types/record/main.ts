/*
 * vinejs
 *
 * (c) VineJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RefsStore, RecordNode } from '@vinejs/compiler/types'

import { BaseType } from '../base.js'
import { SchemaTypes, Transformer } from '../../types.js'
import { BRAND, CBRAND, COMPILER } from '../../symbols.js'

/**
 * VineArray represents an array schema type in the validation
 * pipeline
 */
export class VineRecord<Schema extends SchemaTypes> extends BaseType<
  { [K: string]: Schema[typeof BRAND] },
  { [K: string]: Schema[typeof CBRAND] }
> {
  #schema: Schema

  constructor(schema: Schema) {
    super()
    this.#schema = schema
  }

  /**
   * Compiles to array data type
   */
  [COMPILER](
    propertyName: string,
    refs: RefsStore,
    transform?: Transformer<any, any> | undefined
  ): RecordNode {
    return {
      type: 'record',
      allowNull: this.options.allowNull,
      bail: this.options.bail,
      each: this.#schema[COMPILER]('*', refs, transform),
      fieldName: propertyName,
      propertyName: propertyName,
      isOptional: this.options.isOptional,
      parseFnId: this.options.parse ? refs.trackParser(this.options.parse) : undefined,
      validations: this.validations.map((validation) => {
        return {
          ruleFnId: refs.track({
            validator: validation.rule.validator,
            options: validation.options,
          }),
          implicit: validation.rule.implicit,
          isAsync: validation.rule.isAsync,
        }
      }),
    }
  }
}
