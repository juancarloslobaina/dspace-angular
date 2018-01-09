import { FieldParser } from './field-parser';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { FormFieldModel } from '../models/form-field.model';
import {
  DynamicGroupModel,
  DynamicGroupModelConfig
} from '../ds-dynamic-form-ui/models/ds-dynamic-group/dynamic-group.model';
import { isNotEmpty } from '../../../empty.util';
import { FormRowModel } from '../../../../core/shared/config/config-submission-forms.model';

export class GroupFieldParser extends FieldParser {

  constructor(protected configData: FormFieldModel, protected initFormValues) {
    super(configData, initFormValues);
  }

  public modelFactory(fieldValue: FormFieldMetadataValueObject) {
    // const modelId = uniqueId('group-field-');
    const modelConfiguration: DynamicGroupModelConfig = this.initModel();

    if (this.configData && this.configData.rows && this.configData.rows.length > 0) {
      modelConfiguration.formConfiguration = this.configData.rows;
      modelConfiguration.relationFields = [];
      this.configData.rows.forEach((row: FormRowModel) => {
        row.fields.forEach((field: FormFieldModel) => {
          if (field.selectableMetadata[0].metadata === this.configData.selectableMetadata[0].metadata) {
            modelConfiguration.mandatoryField = this.configData.selectableMetadata[0].metadata;
          } else {
            modelConfiguration.relationFields.push(field.selectableMetadata[0].metadata);
          }
        })
      });
    } else {
      throw new Error(`Configuration not valid: ${modelConfiguration.name}`);
    }

    if (isNotEmpty(this.getInitGroupValues())) {
      modelConfiguration.storedValue = [];
      const mandatoryFieldEntries: FormFieldMetadataValueObject[] = this.getInitFieldValues(modelConfiguration.mandatoryField);
      mandatoryFieldEntries.forEach((entry, index) => {
        const item = Object.create(null);
        item[modelConfiguration.mandatoryField] = entry;
        modelConfiguration.relationFields.forEach((fieldId) => {
          item[fieldId] = this.getInitFieldValue(0, index, [fieldId]);
        });
        modelConfiguration.storedValue.push(item);
      })
    }

    return new DynamicGroupModel(modelConfiguration);
  }

}
