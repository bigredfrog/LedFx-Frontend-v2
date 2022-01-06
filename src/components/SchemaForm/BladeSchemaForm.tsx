import { ReactElement, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  DialogContentText,
  Select,
  MenuItem,
  ListSubheader,
  Switch,
  FormControlLabel,
  Divider,
} from '@material-ui/core';
import { Info } from '@material-ui/icons';
import BladeBoolean from './BladeBoolean';
import BladeSelect from './BladeSelect';
import BladeSlider from './BladeSlider';
import BladeFrame from './BladeFrame';

const useStyles = makeStyles((theme) => ({
  bladeSchemaForm: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  FormListHeaders: {
    background: theme.palette.secondary.main,
    color: '#fff',
  },
}));

interface Schema {
  properties?: any;
  required?: any;
  permitted_keys?: any;
}

interface BladeSchemaFormProps {
  /**
   * Schema to generate Form from. <br />
   * in production this is provided by <br />
   * an external api or a store-management. <br />
   * See examples, for manual usage...
   */
  schema: Schema;
  /**
   * Model is the current value of the schema
   */
  model: Record<string, unknown>;
  /**
   * Hide underline on sub-elements
   */
  disableUnderline?: boolean;
  /**
   * Hide Field-Description Toggle
   */
  hideToggle?: boolean;
  /**
   * onChange function for the given model
   */
  onModelChange?: (e: any) => typeof e;
  /**
   * internal
   */
  type?: string;
}
/**
 * Dynamically render Forms based on a `schema` <br />
 * most schemas retrived from ledfx/api/schema are read-only <br />
 * to enable write, please provide the key `permitted_keys`
 */
const BladeSchemaForm = ({
  schema,
  model,
  disableUnderline,
  hideToggle,
  onModelChange,
  type,
}: BladeSchemaFormProps): ReactElement<any, any> => {
  // console.log(schema)
  const classes = useStyles();
  const [hideDesc, setHideDesc] = useState(true);

  const yzSchema =
    schema &&
    schema.properties &&
    Object.keys(schema.properties)
      .map((sk) => ({
        ...schema.properties[sk],
        id: sk,
        required: schema.required && schema.required.indexOf(sk) !== -1,
        permitted: schema.permitted_keys
          ? schema.permitted_keys.indexOf(sk) > -1
          : true,
      }))
      .sort((a, _b) => (a.required ? -1 : 1))
      .sort((a, _b) => (a.id === 'name' ? -1 : 1));

  function onlyUnique(value: string, index: number, self: any) {
    return self.indexOf(value) === index;
  }

  return (
    <div>
      <div className={classes.bladeSchemaForm}>
        {yzSchema &&
          yzSchema.map((s: any, i: number) => {
            switch (s.type) {
              case 'boolean':
                return (
                  <BladeBoolean
                    hideDesc={hideDesc}
                    key={i}
                    index={i}
                    model={model}
                    model_id={s.id}
                    required={s.required}
                    style={{ margin: '0.5rem 0', flexBasis: '42%' }}
                    schema={s}
                    onClick={(model_id: string, value: any) => {
                      const c: any = {};
                      c[model_id] = value;
                      if (onModelChange) {
                        return onModelChange(c);
                      }
                      return null;
                    }}
                  />
                );
              case 'string': {
                const group: any = {};
                let audio_groups: any = [];
                if (schema?.properties?.audio_device?.enum) {
                  // eslint-disable-next-line
                for (const [key, value] of Object.entries(schema.properties.audio_device?.enum)) {
                    if (typeof value === 'string') {
                      if (!group[value?.split(':')[0]]) {
                        group[value.split(':')[0]] = {};
                      }
                      // eslint-disable-next-line
                    group[value.split(':')[0]][key] = value.split(':')[1];
                    }
                  }

                  audio_groups = Object.values(
                    schema.properties.audio_device?.enum
                  )
                    .map((d: any) => d.split(':')[0])
                    .filter(onlyUnique);
                }

                return audio_groups?.length ? (
                  <BladeFrame
                    key={i}
                    style={{ order: -1 }}
                    title="Audio Device"
                    full
                  >
                    <Select
                      value={(model && model.audio_device) || 0}
                      fullWidth
                      disableUnderline
                      onChange={(e: any) => {
                        const c: any = {};
                        c.audio_device = parseInt(e.target.value, 10);
                        if (onModelChange) {
                          return onModelChange(c);
                        }
                        return null;
                      }}
                      id="grouped-select"
                    >
                      {audio_groups?.map((c: string, ind: number) => [
                        <ListSubheader
                          className={classes.FormListHeaders}
                          color="primary"
                          key={ind}
                        >
                          {c}
                        </ListSubheader>,
                        Object.keys(group[c]).map((e) => (
                          <MenuItem value={e}>{group[c][e]}</MenuItem>
                        )),
                      ])}
                    </Select>
                  </BladeFrame>
                ) : (
                  !(
                    (type === 'mqtt_hass' && s.id === 'name') ||
                    (type === 'mqtt_hass' && s.id === 'description')
                  ) && (
                    <BladeSelect
                      // eslint-disable-next-line
                    children={null}
                      hideDesc={hideDesc}
                      // hide={"test"}
                      model={model}
                      disabled={!s.permitted}
                      wrapperStyle={{
                        margin: '0.5rem 0',
                        width: '42%',
                        flexBasis: 'unset',
                      }}
                      textStyle={{ width: '100%' }}
                      schema={s}
                      required={s.required}
                      model_id={s.id}
                      key={i}
                      index={i}
                      onChange={(model_id: string, value: any) => {
                        const c: any = {};
                        c[model_id] = value;
                        if (onModelChange) {
                          return onModelChange(c);
                        }
                        return null;
                      }}
                    />
                  )
                );
              }
              case 'number':
                return (
                  <BladeSlider
                    step={undefined}
                    hideDesc={hideDesc}
                    disabled={!s.permitted}
                    disableUnderline={disableUnderline}
                    key={i}
                    model_id={s.id}
                    model={model}
                    required={s.required}
                    schema={s}
                    onChange={(model_id: string, value: any) => {
                      const c: any = {};
                      c[model_id] = value;
                      if (onModelChange) {
                        return onModelChange(c);
                      }
                      return null;
                    }}
                  />
                );

              case 'integer':
                return (
                  <BladeSlider
                    hideDesc={hideDesc}
                    disabled={!s.permitted}
                    disableUnderline={disableUnderline}
                    step={1}
                    key={i}
                    model_id={s.id}
                    model={model}
                    required={s.required}
                    schema={s}
                    textfield={false}
                    marks={undefined}
                    index={undefined}
                    style={{ margin: '0.5rem 0', width: '42%' }}
                    onChange={(model_id: string, value: any) => {
                      const c: any = {};
                      c[model_id] = value;
                      if (onModelChange) {
                        return onModelChange(c);
                      }
                      return null;
                    }}
                  />
                );
              case 'int':
                return s?.enum?.length > 10 ? (
                  <BladeSlider
                    hideDesc={hideDesc}
                    disabled={!s.permitted}
                    disableUnderline={disableUnderline}
                    marks={s?.enum}
                    step={null}
                    key={i}
                    model_id={s.id}
                    model={model}
                    required={s.required}
                    schema={s}
                    textfield={false}
                    style={{ margin: '0.5rem 0', width: '42%' }}
                    onChange={(model_id: string, value: any) => {
                      const c: any = {};
                      c[model_id] = value;
                      if (onModelChange) {
                        return onModelChange(c);
                      }
                      return null;
                    }}
                  />
                ) : (
                  <BladeSlider
                    hideDesc={hideDesc}
                    disabled={!s.permitted}
                    disableUnderline={disableUnderline}
                    marks={s?.enum}
                    step={null}
                    key={i}
                    model_id={s.id}
                    model={model}
                    required={s.required}
                    schema={s}
                    textfield={false}
                    style={{ margin: '0.5rem 0', width: '42%' }}
                    onChange={(model_id: string, value: any) => {
                      const c: any = {};
                      c[model_id] = value;
                      if (onModelChange) {
                        return onModelChange(c);
                      }
                      return null;
                    }}
                  />
                );
              default:
                return (
                  <>
                    Unsupported type:
                    {s.type}
                  </>
                );
            }
          })}
      </div>
      {!hideToggle && (
        <>
          <Divider style={{ margin: '1rem 0 0.5rem 0' }} />
          <FormControlLabel
            value="start"
            control={
              <Switch
                checked={!hideDesc}
                onChange={(_e) => setHideDesc(!hideDesc)}
              />
            }
            label={
              <DialogContentText
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 0,
                }}
              >
                Field-Descriptions
                <Info style={{ marginLeft: '0.5rem' }} />
              </DialogContentText>
            }
            labelPlacement="end"
          />
        </>
      )}
    </div>
  );
};

BladeSchemaForm.defaultProps = {
  disableUnderline: false,
  hideToggle: undefined,
  onModelChange: undefined,
  type: undefined,
};

export default BladeSchemaForm;